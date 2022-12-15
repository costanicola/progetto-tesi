import requests
import spacy
import sentiment_analyzer as sa
import text_handler
from keywords_handler import KeywordsHandler
import re
import os


def facebook_req(object_id, action):
    url = "https://graph.facebook.com/v14.0/" + object_id + "/" + action + os.environ.get("ACCESS_TOKEN_FACEBOOK_API")
    return requests.get(url).json()


def analyse_text(text):
    text_sentiments = {"positivo": 0, "neutrale": 0, "negativo": 0}
    
    text_no_emoji = text_handler.convert_emoji_ita(text)
    for p in text_handler.split_text_into_paragraphs(text_no_emoji):
        try:
            sent, score = sa.get_sentiment_ita(p)
            text_sentiments[sent] += score
        except RuntimeError:
            for sp in text_handler.split_paragraph(p):
                sent, score = sa.get_sentiment_ita(sp)
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
    
    for key, value in keywords_handler.get_keywords_k_dict().items():
        
        if re.search(rf"\b{key}\b", words_lemmatized) or search_in_similar(value, words_lemmatized) or \
            re.search(rf"\b{key}\b", object_text.lower()) or search_in_similar(value, object_text.lower()):
            
            print(object_date, key)
            keywords_handler.save_k_match([key, object_id, object_type, object_date, sentiment])



nlp = spacy.load("it_core_news_sm")
keywords_handler = KeywordsHandler()


def facebook_search():
    page_id = os.environ.get("FACEBOOK_PAGE_ID")
    res_feed = facebook_req(page_id, "feed?access_token=")
    
    while "next" in res_feed["paging"]:
        
        # POST
        for post in res_feed["data"]:
            
            if "message" in post:
                post_id = post["id"]
                post_created_time = post["created_time"]
                post_text = post["message"]
                
                if (int(post_created_time.split("-")[0]) <= 2022 and int(post_created_time.split("-")[1]) <= 10):
                    return
                
                ### calcolo del sentiment analysis ###
                sentiment = analyse_text(post_text)
                
                ### check parola chiave nel mex del post ###
                check_keywords_presence(post_id, post_text, "post", post_created_time, sentiment)
                
                # INSIGHTS
                res_insights = facebook_req(post_id, "insights?metric=post_reactions_by_type_total&access_token=")
                
                if "data" in res_insights:
                    
                    for stat in res_insights["data"]:
                        for value in stat["values"]:
                            post_insights = value["value"]
                
                # COMMENTI QUI VA PIU INDIETRO ALTRIMENTI NON SI PRENDONO I COMMENTI DEI VIDEOOO!!!!!!!!!! occhio all'id
                res_comment = facebook_req(post_id, "comments?fields=message_tags,id,like_count,message,created_time,comment_count&limit=2500&access_token=")
                
                if ("data" in res_comment) and res_comment["data"]:  # controllo presenza commenti
                        
                    for comment in res_comment["data"]:
                        comment_id = comment["id"]
                        comment_like_count = comment["like_count"]
                        comment_text = comment["message"]
                        comment_created_time = comment["created_time"]
                        
                        # RIMOZIONE NOME DEL PROFILO TAGGATO DAL COMMENTO IN RISPOSTA
                        if "message_tags" in comment:
                            
                            for tag in comment["message_tags"]:
                                
                                if "name" in tag:
                                    comment_text = comment_text.replace(tag["name"], "")
                        
                        if len(comment_text.strip()) and len(comment_text.strip()) > 3:  # se una volta tolti i profili taggati rimane qualcosa e ci sono + di 3 caratteri, aggiungo il commento al db
                            
                            ### calcolo del sentiment analysis ###
                            sentiment = analyse_text(comment_text)
                        
                            ### check parola chiave nel mex del commento ###
                            check_keywords_presence(comment_id, comment_text, "commento", comment_created_time, sentiment)
                        
                        # COMMENTI IN RISPOSTA AI COMMENTI
                        if comment["comment_count"]:
                            
                            res_subcomment = facebook_req(comment_id, "comments?fields=message_tags,id,like_count,message,created_time&limit=2500&access_token=")
                            
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
                                    sentiment = analyse_text(subcomment_text)
                                    
                                    ### check parola chiave nel mex del sottocommento ###
                                    check_keywords_presence(subcomment_id, subcomment_text, "sottocommento", subcomment_created_time, sentiment)
        
        #if (int(post_created_time.split("-")[0]) <= 2020 and int(post_created_time.split("-")[1]) <= 7) or \
        #(int(comment_created_time.split("-")[0]) <= 2020 and int(comment_created_time.split("-")[1]) <= 7) or \
        #(int(subcomment_created_time.split("-")[0]) <= 2020 and int(subcomment_created_time.split("-")[1]) <= 7):
        #    return
        #else:
        res_feed = requests.get(res_feed["paging"]["next"]).json()


def instagram_req(object_id, action):
    url = "https://graph.facebook.com/v14.0/" + object_id + action + os.environ.get("ACCESS_TOKEN_FACEBOOK_API")
    return requests.get(url).json()

def instagram_search():
    res_media = instagram_req(os.environ.get("INSTAGRAM_ACCOUNT_ID"), "/media?access_token=")

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
            
            if (int(post_created_time.split("-")[0]) <= 2022 and int(post_created_time.split("-")[1]) <= 10):
                return
            
            ### calcolo del sentiment analysis ###
            sentiment = analyse_text(post_text)
            
            ### check parola chiave nel mex del post ###
            check_keywords_presence(post_id, post_text, "post", post_created_time, sentiment)
            
            # COMMENTI DEL POST
            if post_comments_count:
                
                res_comment = instagram_req(post_id, "/comments?fields=id,text,timestamp,replies,like_count,from&limit=2500&access_token=")
                
                if ("data" in res_comment) and res_comment["data"]:
                    
                    for comment in res_comment["data"]:
                        
                        comment_id = comment["id"]
                        comment_text = comment["text"]
                        comment_created_time = comment["timestamp"]
                        comment_like_count = comment["like_count"]
                        
                        ### calcolo del sentiment analysis ###
                        sentiment = analyse_text(comment_text)
                    
                        ### check parola chiave nel mex del commento ###
                        check_keywords_presence(comment_id, comment_text, "commento", comment_created_time, sentiment)
                        
                        # COMMENTI IN RISPOSTA
                        if "replies" in comment:
                            
                            for reply in comment["replies"]["data"]:
                                
                                reply_id = reply["id"]
                                reply_text = reply["text"].replace(f"@{comment['from']['username']}", "")
                                reply_created_time = reply["timestamp"]
                                
                                ### calcolo del sentiment analysis ###
                                sentiment = analyse_text(reply_text)
                                
                                ### check parola chiave nel mex del sottocommento ###
                                check_keywords_presence(reply_id, reply_text, "reply", reply_created_time, sentiment)
        
        #if (int(post_created_time.split("-")[0]) <= 2020 and int(post_created_time.split("-")[1]) <= 7) or (int(comment_created_time.split("-")[0]) <= 2020 and int(comment_created_time.split("-")[1]) <= 7) or (int(reply_created_time.split("-")[0]) <= 2020 and int(reply_created_time.split("-")[1]) <= 7):
        #    return
        #else:
        res_media = requests.get(res_media["paging"]["next"]).json()
            

facebook_search()
instagram_search()