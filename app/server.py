# -*- coding: utf-8 -*-
"""
Created on Thu Sep 22 08:32:53 2022
@author: Nicola
"""

from flask import Flask, render_template


app = Flask(__name__)
app.url_map.strict_slashes = False

@app.route("/home")
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
