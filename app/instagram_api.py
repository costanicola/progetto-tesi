# -*- coding: utf-8 -*-
"""
Created on Sun Oct 30 10:13:55 2022

@author: Nicola
"""

import requests
import spacy
from analyzer import Sentiment
import text_handler
from keywords_handler import KeywordsHandler
import re
import os

ACCOUNT_ID = os.environ.get("INSTAGRAM_ACCOUNT_ID")
ACCESS_TOKEN = os.environ.get("ACCESS_TOKEN_FACEBOOK_API")

def instagram_req(object_id, action):
    url = "https://graph.facebook.com/v14.0/" + object_id + action + ACCESS_TOKEN
    return requests.get(url).json()

def analyse_text(text):
    text_sentiments = {"positivo": 0, "neutrale": 0, "negativo": 0}
    
    for p in text_handler.split_text_into_paragraphs(text):
        try:
            sent, score = sentiment_analyzer.get_sentiment(p)
            text_sentiments[sent] += score
        except RuntimeError:
            for sp in text_handler.split_paragraph(p):
                sent, score = sentiment_analyzer.get_sentiment(sp)
                text_sentiments[sent] += score
            
    return max(text_sentiments, key=text_sentiments.get)
            

def search_in_similar(similars, text):
    for similar in similars:
        if re.search(rf"\b{similar}\b", text):
            return True
    return False


def check_keywords_presence(object_id, object_text, object_type, object_date, sentiment):
    text = nlp(object_text.lower())
    words_lemmatized = ' '.join([token.lemma_ for token in text if not token.is_punct and not token.is_stop])
    
    for key, value in keywords_handler.get_keywords_darsena_verde_dict().items():
        
        if re.search(rf"\b{key}\b", words_lemmatized) or search_in_similar(value, words_lemmatized):
            
            print(object_id, key)
            keywords_handler.save_darsena_verde_match([key, object_id, object_type, object_date, sentiment])



nlp = spacy.load("it_core_news_sm")
sentiment_analyzer = Sentiment()
keywords_handler = KeywordsHandler()

res_media = instagram_req(ACCOUNT_ID, "/media?access_token=")

while "next" in res_media["paging"]:
    
    # ID DEI MEDIA IG
    for id_media in res_media["data"]:
        
        # POST
        res_post = instagram_req(id_media["id"], "?fields=caption,timestamp,comments_count,like_count&access_token=")
        
        post_id = id_media["id"]
        post_text = res_post["caption"]
        post_created_time = res_post["timestamp"]
        post_comments_count = res_post["comments_count"]
        post_like_count = res_post["like_count"]
        
        ### calcolo del sentiment analysis ###
        #sentiment = analyse_text(post_text)
        
        
        ### check parola chiave nel mex del post ###
        #check_keywords_presence(post_id, post_text, "post", post_created_time, sentiment)
        
        # COMMENTI DEL POST
        if post_comments_count:
            
            res_comment = instagram_req(post_id, "/comments?fields=id,text,timestamp,replies{like_count,id,text,timestamp},like_count,from&limit=500&access_token=")
            
            if ("data" in res_comment) and res_comment["data"]:
                
                for comment in res_comment["data"]:
                    
                    comment_id = comment["id"]
                    comment_text = comment["text"]
                    comment_created_time = comment["timestamp"]
                    comment_like_count = comment["like_count"]
                    
                    ### calcolo del sentiment analysis ###
                    #sentiment = analyse_text(comment_text)
                
                    ### check parola chiave nel mex del commento ###
                    #check_keywords_presence(comment_id, comment_text, "commento", comment_created_time, sentiment)
                    
                    # COMMENTI IN RISPOSTA
                    if "replies" in comment:
                        
                        for reply in comment["replies"]["data"]:
                            
                            reply_id = reply["id"]
                            reply_text = reply["text"].replace(f"@{comment['from']['username']}", "")
                            reply_created_time = reply["timestamp"]
                            reply_like_count = reply["like_count"]
                            
                            ### calcolo del sentiment analysis ###
                            #sentiment = analyse_text(reply_text)
                            
                            ### check parola chiave nel mex del sottocommento ###
                            #check_keywords_presence(reply_id, reply_text, "reply", reply_created_time, sentiment)
    
    res_media = requests.get(res_media["paging"]["next"]).json()