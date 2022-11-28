# -*- coding: utf-8 -*-
"""
Created on Thu Sep 22 08:32:53 2022
@author: Nicola
"""

import os
from flask import Flask, render_template, request
from flask.json import jsonify
import threading
import database as db
import social_api as api
#from sentiment_analyzer import Sentiment, Emotion
import text_handler as th
import file_handler as fh
from datetime import datetime


app = Flask(__name__)
app.url_map.strict_slashes = False
app.config["UPLOAD_FOLDER"] = "./static/upload/"

#sentiment_analyzer = Sentiment()
#emotion_analyzer = Emotion()



def handle_social_comment_analysis(comment):
    #sentiment analysis testo del commento + traduzione delle emoji
    text_comment_no_emoji = th.convert_emoji_ita(comment.get_text())
    
    #a volte si presenta un RuntimeError perchè il classificatore non riesce a analizzare testi troppo lunghi -> splitto in frasi e prendo il sentiment con lo score maggiore
    # try:
    #     sent, score = sentiment_analyzer.get_sentiment_ita(text_comment_no_emoji)
    # except RuntimeError:
    #     text_sentiments = {"positivo": [], "neutrale": [], "negativo": []}
    #     for phr in th.split_paragraph(text_comment_no_emoji):
    #         phr_sent, phr_score = sentiment_analyzer.get_sentiment_ita(phr)
    #         text_sentiments[phr_sent].append(phr_score)
    #     sent = max(text_sentiments, key=text_sentiments.get)
    #     score = sum(text_sentiments[sent]) / len(text_sentiments[sent])
    
    # #inserimento del sentiment analysis nel db
    # analysis_id = db.insert_text_analysis("it", sent, score)
    
    # #inserimento db commento
    # db.insert_social_comment(comment.get_id(), comment.get_created_time(), text_comment_no_emoji, comment.get_like_count(), comment.get_reply_to_id(), comment.get_post_related_id(), analysis_id)


# prendo tutti gli id di facebook e instagram nel db e li confronto con i post e commenti delle pagine per trovarne di nuovi e li inserisco nel db
def check_new_social_informations():
    
    print("============================ POST ==================================")
    # NUOVI POST -> stop quando si trova un post gia nel db o a luglio 2020
    fb_posts_ids = [post["postId"] for post in db.get_social_posts_ids("facebook")]
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
    
    print("============================ COMMENTI ==================================")
    # NUOVI COMMENTI -> stop a luglio 2020
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
            
    

@app.route("/login")
def login_page():
    return render_template("login.html")


@app.route("/registration")
def registration_page():
    return render_template("registration.html")


@app.route("/")
def home_page():
    #threading.Thread(target=check_new_social_informations).start()
    return render_template("home.html")
    

@app.route("/activities")
def activities_log_page():
    return render_template("activities_log.html")


@app.route("/dashboard-darsena")
def dashboard_darsena_page():
    
    data_pie = [{"sentiment": "positivo", "numero": 10}, {"sentiment": "neutrale", "numero": 10}, {"sentiment": "negativo", "numero": 10}]
    
    return render_template("dashboard_darsena.html", darsena_piechart_data=data_pie)


@app.route("/dashboard-social")
def dashboard_social_page():
    return render_template("dashboard_social.html", post_f=db.get_social_posts_count("facebook"), post_i=db.get_social_posts_count("instagram"), 
                           comment_f=db.get_social_comments_count("facebook"), comment_i=db.get_social_comments_count("instagram"),
                           datetime_f=db.get_social_last_post_date("facebook"), datetime_i=db.get_social_last_post_date("instagram"))


@app.route("/dashboard-social/facebook")
def dashboard_facebook_page():
    return render_template("dashboard_social_facebook.html", fb_posts_list=db.get_all_social_posts_preview("facebook"))


@app.route("/dashboard-social/instagram")
def dashboard_instagram_page():
    return render_template("dashboard_social_instagram.html", ig_posts_list=db.get_all_social_posts_preview("instagram"))


@app.route("/dashboard-social/facebook/<post_id>")
def facebook_post_details_page(post_id):
    print(db.get_post_comments_keywords(post_id))
    return render_template("facebook_post_details.html", post_info=db.get_post_details(post_id), keywords_list=db.get_post_comments_keywords(post_id))


@app.route("/dashboard-social/instagram/<post_id>")
def instagram_post_details_page(post_id):
    return render_template("instagram_post_details.html", post_info=db.get_post_details(post_id), keywords_list=db.get_post_comments_keywords(post_id))


@app.route("/dashboard-keywords")
def dashboard_keywords_page():
    
    keywords_sentiment_quantities = db.get_all_keywords_sentiment_quantities()
    all_categories = {q["categoryId"]: q["categoryName"] for q in db.get_all_keywords_categories()}.items()
    attendances_categories = {q["categoryId"]: q["categoryName"] for q in keywords_sentiment_quantities}.items()
    
    return render_template("dashboard_keywords.html", keywords_infos=keywords_sentiment_quantities, categories_infos=all_categories, attendances_categories_infos=attendances_categories)


@app.route("/dashboard-keywords/keyword-<keyword_id>", methods=["POST"])
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
    
    return render_template("archive.html", total_documents=tot_doc, total_positive=tot_pos, total_neutral=tot_neu, total_negative=tot_neg)


@app.route("/archive/document")
def document_details_page():
    return render_template("document_analysis_details.html")


@app.route("/analysis")
def analysis_page():
    return render_template("analysis.html")


# EVENTO BOTTONE INVIO DEL DOCUMENTO PER FARE LA SENTIMENT ANALYSIS
@app.route("/analysis/analysis-result", methods=["POST"])
def document_analysis():
    
    uploaded_text = ""
    textarea_document = request.form.get("textarea")
    language = request.form["analysis_language"]
    search_emotion = request.form.get("switch_feel")
    
    if textarea_document:
        uploaded_text = textarea_document
    
    if "upload_doc" in request.files:
        
        file_document = request.files["upload_doc"]
        filename = file_document.filename
        
        # salvo il file nella cartella upload -> utilizzo dei read nel file_handler e se non salvo il file darebbero errore
        file_document.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
        
        # estraggo il testo dal file
        uploaded_text = fh.extract_text_from_file(f"{app.config['UPLOAD_FOLDER']}{filename}")
        
        if uploaded_text is None:
            #segnalare errore
            pass
        
        if uploaded_text == "":
            #segnalare vuotezza
            pass
        
        # rimuovo il file
        os.remove(f"{app.config['UPLOAD_FOLDER']}{filename}")
    
    #sentiment analysis
    # if language == "it":
        
    #     text = th.convert_emoji_ita(uploaded_text)
        
    #     try:
    #         general_sent, general_score = sentiment_analyzer.get_sentiment_ita(text)
    #     except RuntimeError:
    #         text_sentiments = {"positivo": [], "neutrale": [], "negativo": []}
    #         for phr in th.split_paragraph(text):
    #             phr_sent, phr_score = sentiment_analyzer.get_sentiment_ita(phr)
    #             text_sentiments[phr_sent].append(phr_score)
    #         general_sent = max(text_sentiments, key=text_sentiments.get)
    #         general_score = sum(text_sentiments[general_sent]) / len(text_sentiments[general_sent])
        
    #     if search_emotion:
            
    #         try:
    #             emot, emot_score = emotion_analyzer.get_emotion_ita(text)
    #         except RuntimeError:
    #             text_emotions = {"rabbia": [], "gioia": [], "paura": [], "tristezza": []}
    #             for phr in th.split_paragraph(text):
    #                 phr_emot, phr_score = emotion_analyzer.get_emotion_ita(phr)
    #                 text_emotions[phr_emot].append(phr_score)
    #             emot = max(text_emotions, key=text_emotions.get)
            
    #         analysis_id = db.insert_text_analysis(language, general_sent, general_score, emot)
    #         general_emotion = emot
    #     else:
    #         analysis_id = db.insert_text_analysis(language, general_sent, general_score)
    #         general_emotion = None
        
    #     general_sentiment = general_sent
    #     general_intensity = general_score
        
    #     # ricerca parole
    #     found_keywords = set()
        
    #     # split dei paragrafi
    #     paragraphs_infos = []
    #     paragraphs = th.split_text_into_paragraphs(text.replace("\r", ""))
        
    #     for i, paragraph in enumerate(paragraphs):
            
    #         try:
    #             sent, score = sentiment_analyzer.get_sentiment_ita(paragraph)
    #         except RuntimeError:
    #             phr_sentiments = {"positivo": [], "neutrale": [], "negativo": []}
    #             for phr in th.split_paragraph(paragraph):
    #                 phr_sent, phr_score = sentiment_analyzer.get_sentiment_ita(phr)
    #                 phr_sentiments[phr_sent].append(phr_score)
    #             sent = max(phr_sentiments, key=phr_sentiments.get)
    #             score = sum(phr_sentiments[sent]) / len(phr_sentiments[sent])
            
    #         db.insert_paragraph(i + 1, analysis_id, paragraph, sent, score)
    #         paragraphs_infos.append({"text": paragraph, "sentiment": sent, "intensity": score})
        
    # else:
        
    #     text = th.convert_emoji_eng(uploaded_text)
        
    #     try:
    #         general_sent, general_score = sentiment_analyzer.get_sentiment_eng(text)
    #     except RuntimeError:
    #         text_sentiments = {"positivo": [], "neutrale": [], "negativo": []}
    #         for phr in th.split_paragraph(text):
    #             phr_sent, phr_score = sentiment_analyzer.get_sentiment_eng(phr)
    #             text_sentiments[phr_sent].append(phr_score)
    #         general_sent = max(text_sentiments, key=text_sentiments.get)
    #         general_score = sum(text_sentiments[sent]) / len(text_sentiments[sent])
        
    #     if search_emotion:
            
    #         try:
    #             emot, score = emotion_analyzer.get_emotion_eng(text)
    #         except RuntimeError:
    #             text_emotions = {"neutrale": [], "disgusto": [], "rabbia": [], "gioia": [], "paura": [], "tristezza": [], "stupore": []}
    #             for phr in th.split_paragraph(text):
    #                 phr_emot, phr_score = emotion_analyzer.get_emotion_eng(phr)
    #                 text_emotions[phr_emot].append(phr_score)
    #             emot = max(text_emotions, key=text_emotions.get)
            
    #         analysis_id = db.insert_text_analysis(language, general_sent, general_score, emot)
    #         general_emotion = emot
    #     else:
    #         analysis_id = db.insert_text_analysis(language, general_sent, general_score)
    #         general_emotion = None
        
    #     # ricerca parole
    #     found_keywords = set()
        
    #     # split dei paragrafi
    #     paragraphs_infos = []
    #     paragraphs = th.split_text_into_paragraphs(text.replace("\r", ""))
        
    #     for i, paragraph in enumerate(paragraphs):
    #         try:
    #             sent, score = sentiment_analyzer.get_sentiment_eng(paragraph)
    #         except RuntimeError:
    #             ph_sentiments = {"positivo": [], "neutrale": [], "negativo": []}
    #             for phr in th.split_paragraph(paragraph):
    #                 phr_sent, phr_score = sentiment_analyzer.get_sentiment_eng(phr)
    #                 phr_sentiments[phr].append(phr_score)
    #             sent = max(ph_sentiments, key=ph_sentiments.get)
    #             score = sum(ph_sentiments[sent]) / len(ph_sentiments[sent])
            
    #         db.insert_paragraph(i + 1, analysis_id, paragraph, sent, score)
    #         paragraphs_infos.append({"text": paragraph, "sentiment": sent, "intensity": score})
        
    
    return render_template("analysis_result.html")#, text_sentiment=general_sentiment, text_intensity=general_score, text_emotion=general_emotion, paragraphs_infos=paragraphs_infos, text_keywords=found_keywords)
