import os
from flask import Flask, render_template, request, redirect, url_for, session, flash, abort
from werkzeug.security import generate_password_hash, check_password_hash
from flask.json import jsonify
from functools import wraps
import database as db
import social_api as api
import sentiment_analyzer as analyzer
import text_handler
import file_handler
import ast
from flask_mail import Mail, Message
import spacy
import re
import secrets
from celery_app import make_celery
from celery.schedules import crontab #https://docs.celeryq.dev/en/stable/userguide/periodic-tasks.html -> tabella con gli orari


app = Flask(__name__)
app.url_map.strict_slashes = False
app.config.from_mapping(SECRET_KEY=secrets.token_hex())  #per la session serve una secret key
app.config["UPLOAD_FOLDER"] = "./static/upload/"

app.config.update(CELERY_CONFIG={
    "broker_url": "redis://default:redispw@localhost:49153",
    "result_backend": "redis://default:redispw@localhost:49153",
})
celery = make_celery(app)
celery.conf.beat_schedule = {
    "background-process-every-midnight": {
        "task": "server.bg_process",
        "schedule": 30.0 #crontab(minute=0, hour=0) # <= tutti i giorni a mezzanotte
    },
}

#creazione servizio invio email
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 465
app.config["MAIL_USERNAME"] = os.environ.get("FLASK_MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.environ.get("FLASK_MAIL_PASSWORD")
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USE_SSL"] = True
mail = Mail(app)

nlp = spacy.load("it_core_news_sm")


@celery.task
def bg_process():
    print("PROCESSO IN BG INIZIATO")
    #check_new_social_informations()
    print("BG")
    print("PROCESSO IN BG TERMINATO")


def handle_social_comment_analysis(comment):

    # sentiment analysis testo del commento + traduzione delle emoji
    text_comment_no_emoji = text_handler.convert_emoji_ita(comment.get_text())
    
    # a volte si presenta un RuntimeError perchè il classificatore non riesce a analizzare testi troppo lunghi -> splitto in frasi e prendo il sentiment con lo score maggiore
    try:
        sent, score = analyzer.get_sentiment_ita(text_comment_no_emoji)
    except RuntimeError:
        text_sentiments = {"positivo": [], "neutrale": [], "negativo": []}
        for p in text_handler.split_paragraph(text_comment_no_emoji):
            p_sent, p_score = analyzer.get_sentiment_ita(p)
            text_sentiments[p_sent].append(p_score)
        sent = max(text_sentiments, key=text_sentiments.get)
        score = sum(text_sentiments[sent]) / len(text_sentiments[sent])
    
    # inserimento del sentiment analysis nel db
    analysis_id = db.insert_text_analysis("italiano", sent, score, None, None, None)
    
    # inserimento db commento
    db.insert_social_comment(comment.get_id(), comment.get_created_time(), comment.get_text(), comment.get_like_count(), comment.get_reply_to_id(), comment.get_post_related_id(), analysis_id)


# prendo tutti gli id di facebook e instagram nel db e li confronto con i post e commenti delle pagine per trovarne di nuovi e li inserisco nel db
def check_new_social_informations():
    
    print(" === POST === ")
    
    fb_posts_ids = [post["postId"] for post in db.get_social_posts_ids("facebook")]  # prelevo gli id nel db (post già ottenuti)
    ig_posts_ids = [post["postId"] for post in db.get_social_posts_ids("instagram")]
    
    fb_post_res, fb_comment_res = api.facebook_search(fb_posts_ids)
    ig_post_res, ig_comment_res = api.instagram_search(ig_posts_ids)
    
    # se ci sono nuovi post allora li aggiungo al db
    if fb_post_res:
        for post in fb_post_res:
            db.insert_social_post(post.get_id(), "facebook", post.get_created_time(), post.get_text(), post.get_like_count(), 
                                  post.get_wow_count(), post.get_sigh_count(), post.get_love_count(), post.get_haha_count(), post.get_grrr_count())
    
    if ig_post_res:
        for post in ig_post_res:
            db.insert_social_post(post.get_id(), "instagram", post.get_created_time(), post.get_text(), post.get_like_count())
    
    print(" === COMMENTI === ")
    
    fb_comments_ids = [comment["commentId"] for comment in db.get_social_comments_ids("facebook")]
    ig_comments_ids = [comment["commentId"] for comment in db.get_social_comments_ids("instagram")]
    
    fb_post_res, fb_comment_res = api.facebook_search(fb_comments_ids)
    ig_post_res, ig_comment_res = api.instagram_search(ig_comments_ids)
    
    if fb_comment_res:
        for comment in fb_comment_res:
            handle_social_comment_analysis(comment)
    
    if ig_comment_res:
        for comment in ig_comment_res:
            handle_social_comment_analysis(comment)
            

# wrapper/decorator per impedire di accedere a url dell'app senza prima essersi loggati
def login_required(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if "user_id" in session:
            return f(*args, **kwargs)
        else:
            return render_template("login.html")
    return wrap


# in questo modo non c'è cache tra le richieste: se premo il back navigation button non ritorno a pagine a cui non dovrei accedere
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response


@app.route("/login")
def login_page():
    
    if "user_id" in session:  #se l'utente è loggato non può tornare alla pagina di login
        return render_template("home.html")
    else:
        return render_template("login.html")


@app.route("/logout", methods=["POST"])
def return_to_login_page():
    
    session.pop("user_id", None)
    flash("Logout effettuato con successo!", "success-message")
    return redirect(url_for("login_page"))


@app.route("/check-login", methods=["POST"])
def check_login():
    
    user_mail = request.form["login_email"]
    user_password = request.form["login_password"]
    
    user_info = db.get_user_id_and_password(user_mail)  # prelevo l'id e la password dalla mail
    
    if bool(user_info):
        #se ho un risultato controllo la password nel db con quella del form
        if check_password_hash(user_info["accountPassword"], user_password):
            session["user_id"] = user_info["userId"]
            return redirect(url_for("home_page"))
        else:
            #errore password
            flash("Errore: la password inserita non è corretta!", "error-message")
            return redirect(url_for("login_page"))
    else:
        #errore mail
        flash("Errore: utente non trovato. Assicurarsi di aver attivato l'account!", "error-message")
        return redirect(url_for("login_page"))


@app.route("/registration")
def registration_page():
    
    if "user_id" in session:  #se l'utente è loggato non può tornare alla pagina di registrazione
        return render_template("home.html")
    else:
        return render_template("registration.html")


@app.route("/registration", methods=["POST"])
def register_user():
    
    user_mail = request.form["registration_email"]
    
    for e in db.get_users_emails():
        if user_mail == e["accountEmail"]:
            flash("E-mail già utilizzata e presente nel sistema!", "error-message")
            return redirect(url_for("registration_page"))
    
    user_firstname = request.form["name"]
    user_lastname = request.form["surname"]
    user_password = request.form["registration_password"]
    
    #inserimento utente nel db + password salata
    hash_password = generate_password_hash(user_password)
    new_user_id = db.register_user(user_firstname, user_lastname, user_mail, hash_password)
    
    #invio email
    msg = Message("Attivazione account Piattaforma Mood Ravenna", sender=app.config["MAIL_USERNAME"], recipients=[user_mail])
    msg.html = \
    f"""
    <p>E-MAIL INVIATA AUTOMATICAMENTE</p>
    <p>Gentile {user_firstname} {user_lastname}, per attivare il tuo account devi cliccare il bottone qui sotto.</p>
    <form action="{request.host_url}{url_for("account_activation")}" method="POST">
        <input type="hidden" name="user_id" value="{new_user_id}" />
        <input type="submit" value="ATTIVA ACCOUNT" style="background: #0D6EFD; color: white; padding: 5px 10px; border-radius: 8px;" />
    </form>
    """
    mail.send(msg)
    
    flash("Registrazione effettuata con successo! Controllare l'email per attivare l'account.", "success-message")
    return redirect(url_for("login_page"))


@app.route("/account_activation", methods=["POST"])
def account_activation():
    
    user_id = request.form["user_id"]
    
    if db.get_user_account_enabling(user_id) == 0:  # non attivato
        db.enable_user_account(user_id)
        flash("Account attivato con successo! Adesso è possibile accedere.", "success-message")
        return redirect(url_for("login_page"))
    
    else:  # già attivato
        abort(404)


@app.route("/")
@login_required
def home_page():
    return render_template("home.html")
    

@app.route("/activities")
@login_required
def activities_log_page():
    return render_template("activities_log.html", activities=db.get_all_activities())


@app.route("/dashboard-darsena")
@login_required
def dashboard_darsena_page():
    
    sentiment_quantities = {s["sentiment"]: s["n"] for s in db.get_documents_sentiment_quantities()}
    sentiment_quantities_through_time = db.get_documents_sentiment_quantities_through_time()
    
    for d in sentiment_quantities_through_time:
        d["addedDate"] = d["addedDate"].strftime("%Y-%m-%d")
        
    return render_template("dashboard_darsena.html", darsena_piechart_data=sentiment_quantities, darsena_linechart_data=sentiment_quantities_through_time)


@app.route("/dashboard-social")
@login_required
def dashboard_social_page():
    
    sentiment_quantities = {s["sentiment"]: s["n"] for s in db.get_socials_comments_sentiment_total()}
    min_max_dates= db.get_socials_max_and_min_post_dates()
    from_date = min_max_dates["minDate"].strftime("%Y-%m-%d")
    to_date = min_max_dates["maxDate"].strftime("%Y-%m-%d")
    
    return render_template("dashboard_social.html", from_date=from_date, to_date=to_date, 
                           post_f=db.get_social_posts_count("facebook"), post_i=db.get_social_posts_count("instagram"), 
                           comment_f=db.get_social_comments_count("facebook"), comment_i=db.get_social_comments_count("instagram"),
                           datetime_f=db.get_social_last_post_date("facebook"), datetime_i=db.get_social_last_post_date("instagram"),
                           comments_piechart=sentiment_quantities, keywords_barplot=db.get_socials_keywords_count())


@app.route("/dashboard-social/facebook")
@login_required
def dashboard_facebook_page():
    
    sentiment_quantities = {s["sentiment"]: s["n"] for s in db.get_social_comments_sentiment_quantities("facebook")}
    sentiment_quantities_through_time = db.get_social_comments_sentiment_quantities_through_time("facebook")
    
    for d in sentiment_quantities_through_time:
        d["addedDate"] = d["addedDate"].strftime("%Y-%m-%d")
    
    return render_template("dashboard_social_facebook.html", fb_posts_list=db.get_all_social_posts_preview("facebook"), 
                           fb_comments_piechart=sentiment_quantities, fb_linechart_data=sentiment_quantities_through_time)


@app.route("/dashboard-social/instagram")
@login_required
def dashboard_instagram_page():
    
    sentiment_quantities = {s["sentiment"]: s["n"] for s in db.get_social_comments_sentiment_quantities("instagram")}
    sentiment_quantities_through_time = db.get_social_comments_sentiment_quantities_through_time("instagram")
    
    for d in sentiment_quantities_through_time:
        d["addedDate"] = d["addedDate"].strftime("%Y-%m-%d")
    
    return render_template("dashboard_social_instagram.html", ig_posts_list=db.get_all_social_posts_preview("instagram"),
                            ig_comments_piechart=sentiment_quantities, ig_linechart_data=sentiment_quantities_through_time)


@app.route("/dashboard-social/facebook/<post_id>")
@login_required
def facebook_post_details_page(post_id):
    
    comments_sentiment = {s["sentiment"]: s["n"] for s in db.get_post_comments_sentiment_quantities(post_id)}
    d = [{"reaction": key, "n": value} for key, value in db.get_post_reactions_count(post_id).items()]
    
    return render_template("facebook_post_details.html", post_info=db.get_post_details(post_id), keywords_list=db.get_post_comments_keywords(post_id),
                            comments_info=db.get_post_comments_details(post_id), replies_info=db.get_post_comments_replies_details(post_id),
                            fb_post_reactions_barchart=d, fb_post_comments_piechart=comments_sentiment)


@app.route("/dashboard-social/instagram/<post_id>")
@login_required
def instagram_post_details_page(post_id):
    
    comments_sentiment = {s["sentiment"]: s["n"] for s in db.get_post_comments_sentiment_quantities(post_id)}
    
    return render_template("instagram_post_details.html", post_info=db.get_post_details(post_id), keywords_list=db.get_post_comments_keywords(post_id),
                            comments_info=db.get_post_comments_details(post_id), replies_info=db.get_post_comments_replies_details(post_id),
                            ig_post_comments_piechart=comments_sentiment)


@app.route("/dashboard-social/modify-comment", methods=["POST"])
@login_required
def modify_comment_sentiment():
    
    comment_id = request.form["comment_id"]
    new_sentiment = request.form["new_sentiment"]
    updated_analysis = db.update_comment_sentiment(comment_id, new_sentiment)
    
    return jsonify({"sentiment": updated_analysis["sentiment"], "date": updated_analysis["sentimentUpdateDate"]})


@app.route("/dashboard-keywords")
@login_required
def dashboard_keywords_page():
    
    keywords_sentiment_quantities = db.get_all_keywords_sentiment_quantities()
    all_categories = {q["categoryId"]: q["categoryName"] for q in db.get_all_keywords_categories()}.items()
    attendances_categories = {q["categoryId"]: q["categoryName"] for q in keywords_sentiment_quantities}.items()
    
    return render_template("dashboard_keywords.html", keywords_infos=keywords_sentiment_quantities, categories_infos=all_categories, attendances_categories_infos=attendances_categories)


@app.route("/dashboard-keywords", methods=["POST"])
@login_required
def add_keyword():
    
    selected_category = request.form["keyword_category_selector"].split("value_cat")[1]
    keyword_name = request.form["keyword_name"]
    similars = ast.literal_eval(request.form["similar_keywords"])  #se vuoto: {} altrimenti: {'0': 'sim1', '1': 'sim2'}
    
    keyword_id = db.insert_new_keyword(keyword_name, selected_category)
    for s in similars.values():
        db.insert_keyword_synonym(keyword_id, s)
    
    db.insert_user_activity(f"Inserimento della nuova parola chiave {keyword_name}", session["user_id"])
    
    return redirect(url_for("dashboard_keywords_page"))


@app.route("/dashboard-keywords/keyword-<keyword_id>", methods=["POST"])
@login_required
def dashboard_keywords_charts_modal(keyword_id):
    
    total_piechart = db.get_keyword_total_sentiment_quantities(keyword_id)
    facebook_piechart = db.get_keyword_social_sentiment_quantities(keyword_id, "facebook")
    instagram_piechart = db.get_keyword_social_sentiment_quantities(keyword_id, "instagram")
    document_piechart = db.get_keyword_document_sentiment_quantities(keyword_id)
    
    single_linechart_data = []
    total_linechart_data = []
    for r in db.get_keyword_sentiment_quantities_through_time(keyword_id):
        single_linechart_data.append({"date": r["analysisAddedDate"].strftime("%Y-%m-%d"), "sentiment": "positivo", "n": r["totalPositives"]})
        single_linechart_data.append({"date": r["analysisAddedDate"].strftime("%Y-%m-%d"), "sentiment": "neutrale", "n": r["totalNeutrals"]})
        single_linechart_data.append({"date": r["analysisAddedDate"].strftime("%Y-%m-%d"), "sentiment": "negativo", "n": r["totalNegatives"]})
        total_linechart_data.append({"date": r["analysisAddedDate"].strftime("%Y-%m-%d"), "n": (r["totalPositives"] + r["totalNeutrals"] + r["totalNegatives"])})
    
    synonyms_list = [s["synonymName"] for s in db.get_keyword_synonyms(keyword_id)]
    
    return jsonify({"total_piechart": total_piechart, "facebook_piechart": facebook_piechart, "instagram_piechart": instagram_piechart, "document_piechart": document_piechart, "single_linechart": single_linechart_data, "total_linechart": total_linechart_data, "synonyms": synonyms_list})


@app.route("/archive")
@login_required
def archive_page():
    
    tot_pos, tot_neu, tot_neg = 0, 0, 0
    for r in db.get_documents_sentiment_quantities():
        if r["sentiment"] == "positivo":
            tot_pos = r["n"]
        elif r["sentiment"] == "neutrale":
            tot_neu = r["n"]
        else:
            tot_neg = r["n"]
    tot_doc = tot_pos + tot_neu + tot_neg
    
    return render_template("archive.html", documents_list=db.get_documents_preview(), user_id=session["user_id"], 
                           total_documents=tot_doc, total_positive=tot_pos, total_neutral=tot_neu, total_negative=tot_neg)


@app.route("/archive/document/<int:analysis_id>")
@login_required
def document_details_page(analysis_id):
    return render_template("document_analysis_details.html", document_info=db.get_document_details(analysis_id), 
                            keywords_list=db.get_document_keywords(analysis_id), paragraphs_info=db.get_document_paragraphs_details(analysis_id))


@app.route("/dashboard-social/modify-document<int:analysis_id>", methods=["POST"])
@login_required
def modify_document_sentiment(analysis_id):
    
    new_sentiment = request.form.get("new_sentiment")
    if new_sentiment:
        old_sentiment = db.update_document_sentiment(analysis_id, new_sentiment)
        db.insert_user_activity(f"Modifica di un documento (n° {analysis_id}): {old_sentiment}  -->  {new_sentiment}", session["user_id"])
    
    set_emotion_hiding = request.form.get("set_emotion_hiding")
    if set_emotion_hiding:
        db.update_document_emotion_hiding(analysis_id)
    
    return jsonify({"success": url_for("document_details_page", analysis_id=analysis_id)})
    

@app.route("/dashboard-social/delete-document<int:analysis_id>", methods=["POST"])
@login_required
def delete_document_sentiment(analysis_id):
    
    db.delete_document(analysis_id)
    db.insert_user_activity(f"Eliminazione di un documento (n° {analysis_id})", session["user_id"])
    
    return redirect(url_for("archive_page"))


@app.route("/analysis")
@login_required
def analysis_page():
    return render_template("analysis.html")


# EVENTO BOTTONE INVIO DEL DOCUMENTO PER FARE LA SENTIMENT ANALYSIS
@app.route("/analysis/analysis-result", methods=["POST"])
@login_required
def document_analysis():
    
    textarea_document = request.form.get("textarea")
    language = "italiano" if request.form["analysis_language"] == "it" else "inglese"
    search_emotion = request.form.get("switch_feel")
    
    uploaded_text = ""
    
    if textarea_document:  # se la textarea contiene il testo da analizzare
        uploaded_text = textarea_document
    
    if "upload_doc" in request.files:
        
        file_document = request.files["upload_doc"]
        filename = file_document.filename
        
        # salvo il file nella cartella upload -> utilizzo dei read nel file_handler e se non salvo il file darebbero errore
        file_document.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        
        # estraggo il testo dal file
        uploaded_text = file_handler.extract_text_from_file(f"{app.config['UPLOAD_FOLDER']}{filename}")
        
        if uploaded_text is None:
            return render_template("analysis.html", message="Il file caricato non è tra quelli supportati!")
        
        if uploaded_text == "":
            return render_template("analysis.html", message="Il file caricato è privo di testo da analizzare!")
        
        # rimuovo il file
        os.remove(f"{app.config['UPLOAD_FOLDER']}{filename}")
    
    #sentiment analysis sull'intero testo
    text = text_handler.convert_emoji_ita(uploaded_text) if language == "italiano" else text_handler.convert_emoji_eng(uploaded_text())
    
    try:
        entire_sentiment, entire_sentiment_score = analyzer.get_sentiment_ita(text) if language == "italiano" else analyzer.get_sentiment_eng(text)
    except RuntimeError:
        sentiment_results = {s: [] for s in analyzer.get_possible_sentiment_results()}
        for p in text_handler.split_paragraph(text):
            p_sentiment, p_score = analyzer.get_sentiment_ita(p) if language == "italiano" else analyzer.get_sentiment_eng(p)
            sentiment_results[p_sentiment].append(p_score)
        entire_sentiment = max(sentiment_results, key=sentiment_results.get)
        entire_sentiment_score = sum(sentiment_results[entire_sentiment]) / len(sentiment_results[entire_sentiment])
    
    if search_emotion:
        
        try:
            entire_emotion, entire_emotion_score = analyzer.get_emotion_ita(text) if language == "italiano" else analyzer.get_emotion_eng(text)
        except RuntimeError:
            emotion_results = {e: [] for e in analyzer.get_possible_emotion_result()}
            for p in text_handler.split_paragraph(text):
                p_emotion, p_score = analyzer.get_emotion_ita(p) if language == "italiano" else analyzer.get_emotion_eng(p)
                emotion_results[p_emotion].append(p_score)
            entire_emotion = max(emotion_results, key=emotion_results.get)
    
        emotion_hide = 0  # non si nasconde l'emozione all'utente
    
    else:
        entire_emotion = None
        emotion_hide = None
    
    session.update({"document_language": language, "document_sentiment": entire_sentiment, "document_sentiment_score": entire_sentiment_score, 
                    "document_emotion": entire_emotion, "document_emotion_hide": emotion_hide})
        
    # ricerca parole chiave
    found_keywords = set()
    
    # dizionario con {"nome parola chiave 1": ["sinonimo1", "sinonimo2"], "nome parola chiave 2": [], ...}
    keywords_with_synonyms = {k["keywordName"]: [s["synonymName"] for s in db.get_keyword_synonyms(k["keywordId"])] for k in db.get_all_keywords()}
    
    nlp_text = nlp(text.lower())
    words_lemmatized = ' '.join([token.lemma_ for token in nlp_text if not token.is_punct and not token.is_stop])
    
    for key, value in keywords_with_synonyms.items():
        
        if re.search(rf"\b{key}\b", words_lemmatized) or search_in_similar(value, words_lemmatized) or \
            re.search(rf"\b{key}\b", text.lower()) or search_in_similar(value, text.lower()):
        
                found_keywords.add(key)
    
    session["keywords"] = list(found_keywords)
    
    # split in paragrafi
    paragraphs_info = []
    splitted_text = text_handler.split_text_into_paragraphs(uploaded_text.replace("\r", ""))
        
    for paragraph in splitted_text:
        
        try:
            paragraph_sentiment, paragraph_score = analyzer.get_sentiment_ita(paragraph) if language == "italiano" else analyzer.get_sentiment_eng(paragraph)
        except RuntimeError:
            sentiment_results = {s: [] for s in analyzer.get_possible_sentiment_results()}
            for sub_p in text_handler.split_paragraph(paragraph):
                sub_p_sentiment, sub_p_score = analyzer.get_sentiment_ita(sub_p) if language == "italiano" else analyzer.get_sentiment_eng(sub_p)
                sentiment_results[sub_p_sentiment].append(sub_p_score)
            paragraph_sentiment = max(sentiment_results, key=sentiment_results.get)
            paragraph_score = sum(sentiment_results[paragraph_sentiment]) / len(sentiment_results[paragraph_sentiment])
        
        paragraphs_info.append({"text": paragraph, "sentiment": paragraph_sentiment, "intensity": paragraph_score})
    
    session["paragraphs"] = paragraphs_info
    
    return render_template("analysis_result.html", text_sentiment=entire_sentiment, text_intensity=entire_sentiment_score, text_emotion=entire_emotion, paragraphs_info=paragraphs_info, text_keywords=found_keywords)


@app.route("/analysis/analysis-result/confirm", methods=["POST"])
@login_required
def confirm_document_save():
    
    # aggiunta analisi al db
    analysis_id = db.insert_text_analysis(session["document_language"], session["document_sentiment"], session["document_sentiment_score"], 
                                          session["document_emotion"], session["document_emotion_hide"], session["user_id"])
    
    # aggiunta parole chiavi al db
    for keyword_name in session["keywords"]:
        db.insert_text_keyword_attendance(keyword_name, analysis_id)
    
    # aggiunta paragrafi del testo analizzato al db
    for i, paragraph in enumerate(session["paragraphs"]):
        db.insert_paragraph(i + 1, analysis_id, paragraph["text"], paragraph["sentiment"], paragraph["intensity"])
    
    db.insert_user_activity(f"Salvataggio di un nuovo documento {session['document_sentiment']} (n° {analysis_id})", session["user_id"])
    
    return render_template("analysis.html", message="Documento salvato con successo!")


def search_in_similar(similars, text):
    for similar in similars:
        if re.search(rf"\b{similar}\b", text):
            return True
    return False