# -*- coding: utf-8 -*-
"""
Created on Wed Oct 19 10:43:07 2022
@author: Nicola
"""

import requests
import spacy
from analyzer import Sentiment
import csv


def facebook_req(object_id, action):
    url = "https://graph.facebook.com/v14.0/" + object_id + "/" + action + "***"
    return requests.get(url).json()


def calc_sentiment(paragaphs):
    text_sentiments = {"positivo": 0, "neutrale": 0, "negativo": 0}
    
    for p in paragaphs:
        
        try:
            sent = sentiment_analyzer.get_sentiment(p)
        except RuntimeError:
            sent = "neutrale"
            
        text_sentiments[sent] += 1
    
    return max(text_sentiments, key=text_sentiments.get)


def analyse_split_text(text):
    paragraphs = text.split("\n\n")
    
    for p in paragraphs:
        
        if len(p) > 4000:
            paragraphs = p.split(".")
            break
    
    return calc_sentiment(paragraphs)
            

def check_keywords_presence(object_id, object_text, object_type, object_date, sentiment):
    text = nlp(object_text.lower())
    words = [token.lemma_ for token in text if not token.is_punct and not token.is_stop]
    
    for key, value in keywords_darsena_verde.items():
        
        if (key in words) or (value in words):
            
            print(object_id)
            with open("static/keywords/darsena-verde-result.csv", "a") as f:
                csvwriter = csv.writer(f)
                csvwriter.writerow([key, object_id, object_type, object_date, sentiment])



nlp = spacy.load("it_core_news_sm")
sentiment_analyzer = Sentiment()

# PRELEVO PAROLE CHIAVE DA FILE
keywords_darsena_verde = dict()  # dizionario con k la parola principale e v una lista di simili

with open("static/keywords/darsena-verde.txt", encoding="utf-8") as f:
    for line in f:
        keyword = line.strip().split(", ")
        keywords_darsena_verde[keyword[0]] = keyword[1:]


page_id = "***"
res_feed = facebook_req(page_id, "feed?access_token=")

while "next" in res_feed["paging"]:
    
    # POST
    for post in res_feed["data"]:
        
        if "message" in post:
            post_id = post["id"]
            post_created_time = post["created_time"]
            post_text = post["message"]
            
            ### calcolo del sentiment analysis ###
            sentiment = analyse_split_text(post_text)
            
            ### check parola chiave nel mex del post ###
            check_keywords_presence(post_id, post_text, "post", post_created_time, sentiment)
            
            # INSIGHTS
            res_insights = facebook_req(post_id, "insights?metric=post_reactions_by_type_total&access_token=")
            
            if "data" in res_insights:
                
                for stat in res_insights["data"]:
                    for value in stat["values"]:
                        post_insights = value["value"]
            
            # COMMENTI
            res_comment = facebook_req(post_id, "comments?fields=message_tags,id,like_count,message,created_time,comment_count&limit=500&access_token=")
            
            if ("data" in res_comment) and res_comment["data"]:  # controllo presenza commenti
                    
                for comment in res_comment["data"]:
                    comment_id = comment["id"]
                    comment_like_count = comment["like_count"]
                    comment_text = comment["message"]
                    comment_created_time = comment["created_time"]
                    
                    # RIMOZIONE NOME DEL PROFILO TAGGATO DAL COMMENTO IN RISPOSTA
                    if "message_tags" in comment:
                        
                        for tag in comment["message_tags"]:
                            comment_text = comment_text.replace(tag["name"], "")
                    
                    if len(comment_text.strip()) and len(comment_text.strip()) > 3:  # se una volta tolti i profili taggati rimane qualcosa e ci sono + di 3 caratteri, aggiungo il commento al db
                        
                        ### calcolo del sentiment analysis ###
                        sentiment = analyse_split_text(comment_text)
                    
                        ### check parola chiave nel mex del commento ###
                        check_keywords_presence(comment_id, comment_text, "commento", comment_created_time, sentiment)
                    
                    # COMMENTI IN RISPOSTA AI COMMENTI
                    if comment["comment_count"]:
                        
                        res_subcomment = facebook_req(comment_id, "comments?fields=message_tags,id,like_count,message,created_time&limit=500&access_token=")
                        
                        for subcomment in res_subcomment["data"]:
                            subcomment_id = subcomment["id"]
                            subcomment_like_count = subcomment["like_count"]
                            subcomment_text = subcomment["message"]
                            subcomment_created_time = subcomment["created_time"]
                                                            
                            # RIMOZIONE NOME DEL PROFILO TAGGATO DAL COMMENTO IN RISPOSTA
                            if "message_tags" in subcomment:
                                
                                for tag in subcomment["message_tags"]:
                                    
                                    if "name" in tag:
                                        subcomment_text = subcomment_text.replace(tag["name"], "")
                            
                            if len(subcomment_text.strip()) and len(subcomment_text.strip()) > 3:
                                
                                ### calcolo del sentiment analysis ###
                                sentiment = analyse_split_text(subcomment_text)
                                
                                ### check parola chiave nel mex del sottocommento ###
                                check_keywords_presence(subcomment_id, subcomment_text, "sottocommento", subcomment_created_time, sentiment)
                    
    res_feed = requests.get(res_feed["paging"]["next"]).json()

