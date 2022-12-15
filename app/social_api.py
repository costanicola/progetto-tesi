import requests
from datetime import datetime
from post import Post
from comment import Comment
import os


API_ACCESS_TOKEN = os.environ.get("ACCESS_TOKEN_FACEBOOK_API")
FB_PAGE_ID = os.environ.get("FACEBOOK_PAGE_ID")
IG_PAGE_ID = os.environ.get("INSTAGRAM_ACCOUNT_ID")
API_VERSION = 14.0
STOP_YEAR = 2022
STOP_MONTH = 7


def facebook_api_req(object_id, action):
    url = f"https://graph.facebook.com/v{API_VERSION}/{object_id}{action}{API_ACCESS_TOKEN}"
    return requests.get(url).json()


def timestamp_to_datetime(timestamp):
    return datetime.fromtimestamp(timestamp)


def facebook_search(db_ids):
    posts_list = []
    comments_list = []
    
    res_feed = facebook_api_req(FB_PAGE_ID, "/feed?date_format=U&access_token=")
    
    while "next" in res_feed["paging"]:
        
        # POST
        for post in res_feed["data"]:
            
            if "message" in post:
                post_id = post["id"]
                post_created_time = timestamp_to_datetime(post["created_time"])
                post_text = post["message"]
                
                if (post_created_time.year <= STOP_YEAR and post_created_time.month <= STOP_MONTH):
                    return posts_list, comments_list
                
                # INSIGHTS
                res_insights = facebook_api_req(post_id, "/insights?metric=post_reactions_by_type_total&access_token=")
                
                if "data" in res_insights:
                    
                    for stat in res_insights["data"]:
                        for value in stat["values"]:
                            post_insights = value["value"]
                
                else:
                    post_insights = {}
                
                if post_id not in db_ids:
                    posts_list.append(Post(post_id, post_created_time, post_text, post_insights))
                
                # COMMENTI
                res_comment = facebook_api_req(post_id, "/comments?fields=message_tags,id,like_count,message,created_time,comment_count&date_format=U&limit=2000&access_token=")
                
                if ("data" in res_comment) and res_comment["data"]:  # controllo presenza commenti
                        
                    for comment in res_comment["data"]:
                        comment_id = comment["id"]
                        comment_like_count = comment["like_count"]
                        comment_text = comment["message"]
                        comment_created_time = timestamp_to_datetime(comment["created_time"])
                        
                        # RIMOZIONE NOME DEL PROFILO TAGGATO DAL COMMENTO IN RISPOSTA
                        if "message_tags" in comment:
                            
                            for tag in comment["message_tags"]:
                                
                                if "name" in tag:
                                    comment_text = comment_text.replace(tag["name"], "")
                        
                        if len(comment_text.strip()):
                            
                            if comment_id not in db_ids:
                                comments_list.append(Comment(comment_id, comment_created_time, comment_text, comment_like_count, post_id))
                        
                        # COMMENTI IN RISPOSTA AI COMMENTI
                        if comment["comment_count"]:
                            
                            res_subcomment = facebook_api_req(comment_id, "/comments?fields=message_tags,id,like_count,message,created_time&date_format=U&limit=2000&access_token=")
                            
                            for subcomment in res_subcomment["data"]:
                                subcomment_id = subcomment["id"]
                                subcomment_like_count = subcomment["like_count"]
                                subcomment_text = subcomment["message"]
                                subcomment_created_time = timestamp_to_datetime(subcomment["created_time"])
                                                                
                                # RIMOZIONE NOME DEL PROFILO TAGGATO DAL COMMENTO IN RISPOSTA
                                if "message_tags" in subcomment:
                                    
                                    for tag in subcomment["message_tags"]:
                                        
                                        if "name" in tag:
                                            subcomment_text = subcomment_text.replace(tag["name"], "")
                                
                                if len(subcomment_text.strip()):
                                    
                                    if subcomment_id not in db_ids:
                                        comments_list.append(Comment(subcomment_id, subcomment_created_time, subcomment_text, subcomment_like_count, post_id, comment_id))
        
        res_feed = requests.get(res_feed["paging"]["next"]).json()


def instagram_search(db_ids):
    posts_list = []
    comments_list = []
    
    res_media = facebook_api_req(IG_PAGE_ID, "/media?access_token=")

    while "next" in res_media["paging"]:
        
        # ID DEI MEDIA IG
        for id_media in res_media["data"]:
            
            # POST
            res_post = facebook_api_req(id_media["id"], "?fields=caption,timestamp,comments_count,like_count&date_format=U&access_token=")
            
            post_id = id_media["id"]
            post_text = res_post["caption"]
            post_created_time = timestamp_to_datetime(res_post["timestamp"])
            post_comments_count = res_post["comments_count"]
            insights = {"like": res_post["like_count"]}
            
            if (post_created_time.year <= STOP_YEAR and post_created_time.month <= STOP_MONTH):
                return posts_list, comments_list
            
            if post_id not in db_ids:
                posts_list.append(Post(post_id, post_created_time, post_text, insights))
            
            # COMMENTI DEL POST
            if post_comments_count:
                
                res_comment = facebook_api_req(post_id, "/comments?fields=id,text,timestamp,replies,like_count,from&date_format=U&limit=500&access_token=")
                
                if ("data" in res_comment) and res_comment["data"]:
                    
                    for comment in res_comment["data"]:
                        
                        comment_id = comment["id"]
                        comment_text = comment["text"]
                        comment_created_time = timestamp_to_datetime(comment["timestamp"])
                        comment_like_count = comment["like_count"]
                        
                        if comment_id not in db_ids:
                            comments_list.append(Comment(comment_id, comment_created_time, comment_text, comment_like_count, post_id))
                        
                        # COMMENTI IN RISPOSTA
                        if "replies" in comment:
                            
                            for reply in comment["replies"]["data"]:
                                
                                reply_id = reply["id"]
                                reply_text = reply["text"].replace(f"@{comment['from']['username']}", "")
                                reply_created_time = timestamp_to_datetime(reply["timestamp"])
                                
                                if len(reply_text.strip()):
                                    
                                    if reply_id not in db_ids:
                                        comments_list.append(Comment(reply_id, reply_created_time, reply_text, 0, post_id, comment_id))
        
        res_media = requests.get(res_media["paging"]["next"]).json()