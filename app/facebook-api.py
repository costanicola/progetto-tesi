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
    url = "https://graph.facebook.com/v14.0/" + object_id + "/" + action + "****"
    return requests.get(url).json()


def check_keywords_presence(object_id, object_text, object_type):
    text = nlp(object_text.lower())
    words = [token.lemma_ for token in text if not token.is_punct and not token.is_stop]
    
    for key, value in keywords_darsena_verde.items():
        
        if (key in words) or (value in words):
            
            sentiment = sentiment_analyzer.get_sentiment(object_text)
            
            with open("static/keywords/darsena-verde-result.csv", "a") as f:
                csvwriter = csv.DictWriter(f, ["KEYWORD", "OBJECT_ID", "OBJECT_TYPE", "SENTIMENT"])
                csvwriter.writerow({"KEYWORD": key, "OBJECT_ID": object_id, "OBJECT_TYPE": object_type, "SENTIMENT": sentiment})



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
            
            ### check parola chiave nel mex del post  ###
            check_keywords_presence(post_id, post_text, "post")
            
            # INSIGHTS
            res_insights = facebook_req(post_id, "insights?metric=post_reactions_by_type_total&access_token=")
            
            for stat in res_insights["data"]:
                for value in stat["values"]:
                    post_insights = value["value"]
            
            # COMMENTI
            res_comment = facebook_req(post_id, "comments?fields=message_tags,id,like_count,message,comment_count&limit=500&access_token=")
            
            if res_comment["data"]:  # controllo presenza commenti
                    
                for comment in res_comment["data"]:
                    comment_id = comment["id"]
                    comment_like_count = comment["like_count"]
                    comment_text = comment["message"]
                    
                    # RIMOZIONE NOME DEL PROFILO TAGGATO DAL COMMENTO IN RISPOSTA
                    if "message_tags" in comment:
                        
                        for tag in comment["message_tags"]:
                            comment_text = comment_text.replace(tag["name"], "")
                    
                    if len(comment_text.strip()) and len(comment_text.strip()) > 3:  # se una volta tolti i profili taggati rimane qualcosa e ci sono + di 3 caratteri, aggiungo il commento al db
                        
                        ### check parola chiave nel mex del commento  ###
                        check_keywords_presence(comment_id, comment_text, "commento")
                    
                    # COMMENTI IN RISPOSTA AI COMMENTI
                    if comment["comment_count"]:
                        
                        res_subcomment = facebook_req(comment_id, "comments?fields=message_tags,id,like_count,message&limit=500&access_token=")
                        
                        for subcomment in res_subcomment["data"]:
                            subcomment_id = subcomment["id"]
                            subcomment_like_count = subcomment["like_count"]
                            subcomment_text = subcomment["message"]
                                                            
                            # RIMOZIONE NOME DEL PROFILO TAGGATO DAL COMMENTO IN RISPOSTA
                            if "message_tags" in subcomment:
                                
                                for tag in subcomment["message_tags"]:
                                    subcomment_text = subcomment_text.replace(tag["name"], "")
                            
                            if len(subcomment_text.strip()) and len(subcomment_text.strip()) > 3:
                                
                                ### check parola chiave nel mex del sottocommento  ###
                                check_keywords_presence(subcomment_id, subcomment_text, "sottocommento")
                    
    res_feed = requests.get(res_feed["paging"]["next"]).json()