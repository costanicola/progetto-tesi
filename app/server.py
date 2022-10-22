# -*- coding: utf-8 -*-
"""
Created on Thu Sep 22 08:32:53 2022
@author: Nicola
"""

from flask import Flask, render_template, request

# PER VEDERE FACCINE O EMOTICON: https://www.adamsmith.haus/python/docs/nltk.TweetTokenizer questa potrebbe essere un'idea

app = Flask(__name__)
app.url_map.strict_slashes = False


@app.route("/login")
def login_page():
    return render_template("login.html")


@app.route("/registration")
def registration_page():
    return render_template("registration.html")


@app.route("/")
def home_page():
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
    return render_template("dashboard_social.html")


@app.route("/dashboard-keywords")
def dashboard_keywords_page():
    
    keywords = ["polizia", "bicicletta", "darsena", "amici", "marciapiede", "sicurezza", "poddare", "sostenibilità"]
    
    return render_template("dashboard_keywords.html", keywords_list=keywords)


@app.route("/archive")
def archive_page():
    
    tot_doc = 105
    tot_pos = 34
    tot_neu = 61
    tot_neg = 10
    
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
    
    text_document = request.form.get("textarea")
    file_document = request.form.get("upload_doc")
    language = request.form["analysis_language"]
    search_emotion = request.form.get("switch_feel")
    
    if text_document:
        pass
    
    if file_document:
        pass
    
    # dai due if qui su ottengo il testo del documento
    
    # divido una sua COPIA in una lista di paragrafi
    
    # sentiment analysis intero testo (con la lingua selezionata) e opzionalmente feeling (usare struttura di ES. qui sotto)
    
    # ricerco le parole chiave nel testo intero
    
    # in una lista di dizionari, per ogni paragrafo: il testo, sentiment analysis e intensità
    
    # ES.
    
    general_sentiment = "negativo"
    #no feeling
    general_emotion = ("tristezza" if True else None)
    
    text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Tempor orci eu lobortis elementum nibh tellus molestie nunc. Sodales ut etiam sit amet nisl purus in mollis. Enim lobortis scelerisque fermentum dui faucibus in ornare quam. Lacus sed viverra tellus in hac habitasse. Mattis ullamcorper velit sed ullamcorper morbi tincidunt ornare. Tristique senectus et netus et malesuada fames. Iaculis at erat pellentesque adipiscing commodo elit. Aliquet porttitor lacus luctus accumsan tortor. Facilisis leo vel fringilla est ullamcorper eget nulla facilisi etiam. Ridiculus mus mauris vitae ultricies leo integer. Ante metus dictum at tempor commodo"
    #parole
    keywords = {"marciapiede", "amici", "et", "amet"}
    
    found_keywords = set()
    for w in text.split(): #qui split va anche bene: "elit," -> lo vede come "elit"
        if w in keywords:
            found_keywords.add(w)
    
    paragraphs = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", 
                  "Tempor orci eu lobortis elementum nibh tellus molestie nunc. Sodales ut etiam sit amet nisl purus in mollis. Enim lobortis scelerisque fermentum dui faucibus in ornare quam",
                  "Lacus sed viverra tellus in hac habitasse. Mattis ullamcorper velit sed ullamcorper morbi tincidunt ornare",
                  "Tristique senectus et netus et malesuada fames. Iaculis at erat pellentesque adipiscing commodo elit. Aliquet porttitor lacus luctus accumsan tortor. Facilisis leo vel fringilla est ullamcorper eget nulla facilisi etiam. Ridiculus mus mauris vitae ultricies leo integer. Ante metus dictum at tempor commodo",
                  "Urna duis convallis convallis tellus id."]
    
    paragraphs_infos = []
    for p in paragraphs:
        sent, intens = fake_sentiment(p)
        paragraphs_infos.append({"text": p, "sentiment": sent, "intensity": intens})
    
    
    return render_template("analysis_result.html", text_sentiment=general_sentiment, text_emotion=general_emotion, paragraphs_infos=paragraphs_infos, text_keywords=found_keywords)


from random import randrange

def fake_sentiment(p):
    x = ["positivo", "neutrale", "negativo"]
    return x[randrange(3)], randrange(100)