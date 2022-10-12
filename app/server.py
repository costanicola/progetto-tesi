# -*- coding: utf-8 -*-
"""
Created on Thu Sep 22 08:32:53 2022
@author: Nicola
"""

from flask import Flask, render_template, request


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
    return render_template("dashboard_darsena.html")

@app.route("/dashboard-social")
def dashboard_social_page():
    return render_template("dashboard_social.html")

@app.route("/dashboard-keywords")
def dashboard_keywords_page():
    return render_template("dashboard_keywords.html")

@app.route("/archive")
def archive_page():
    return render_template("archive.html")

@app.route("/archive/document")
def document_details_page():
    return render_template("document_analysis_details.html")

@app.route("/analysis")
def analysis_page():
    return render_template("analysis.html")

@app.route("/analysis/analysis-result")
def analysis_result_page():
    return render_template("analysis_result.html")

# EVENTO BOTTONE INVIO DEL TESTO PER FARE LA SENTIMENT ANALYSIS
@app.route("/analysis/analysis-result", methods=["POST"])
def document_analysis():
    
    text_document = request.form.get("textarea")
    file_document = request.form.get("upload_doc")
    language = request.form["analysis_language"]
    search_emotion = request.form.get("switch_feel")
    
    #if (search_emotion):
    #    print("oonn")
    #else:
    #    print("NOOO")
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    return render_template("analysis_result.html")