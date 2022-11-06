# -*- coding: utf-8 -*-
"""
Created on Mon Oct 31 14:49:28 2022
@author: Nicola
"""

import mysql.connector
from datetime import datetime

class DB():
    
    def __init__(self):
        self.conn = None
        self.cursor = None
    
    
    def connect_db(self):
        self.conn = mysql.connector.connect(user="root", password="maisciquel", host="127.0.0.1", database="thesisdb")
        self.cursor = self.conn.cursor(dictionary=True, buffered=True)
    
    
    def get_social_posts_ids(self, social_name):
        """
        Ritorna tutti gli id di facebook/instagram della tabella dei post. Servono per bloccare il loop delle API.
        """
        select = ("SELECT postId "
                  "FROM socialPosts "
                  "WHERE socialName = %s")
        param = (social_name, )
        self.cursor.execute(select, param)
        return self.cursor.fetchall()
    
    
    def get_social_comments_ids(self, social_name):
        """
        Ritorna tutti gli id di facebook/instagram della tabella dei commenti. Servono per bloccare il loop delle API.
        """
        select = ("SELECT c.commentId "
                  "FROM postComments c JOIN socialPosts p ON (c.postK = p.postId) "
                  "WHERE p.socialName = %s")
        param = (social_name, )
        self.cursor.execute(select, param)
        return self.cursor.fetchall()
    
    
    def insert_text_analysis(self, language, sentiment, sentiment_intensity, emotion=None):
        """
        Inserisce la sentiment analysis di un testo nel db e ritorna il suo id (ultimo id dell'inserimento)
        """
        insert = ("INSERT INTO textAnalysis (analysisLanguage, analysisAddedDate, sentiment, sentimentIntensity, emotion) "
                  "VALUES (%s, %s, %s, %s, %s)")
        param = (language, datetime.today().strftime("%Y-%m-%d"), sentiment, sentiment_intensity, emotion)
        self.cursor.execute(insert, param)
        self.conn.commit()
        
        select = ("SELECT MAX(analysisId) AS analysisId "
                  "FROM textAnalysis")
        self.cursor.execute(select)
        return self.cursor.fetchone()["analysisId"]
    
    
    def insert_social_post(self, post_id, social_name, pubblication_datetime, caption, n_like, n_wow=None, n_sigh=None, n_love=None, n_haha=None, n_grrr=None):
        """
        Inserisce un post facebook/instagram nel db.
        """
        insert = ("INSERT INTO socialPosts (postId, socialName, pubblicationDatetime, caption, nLike, nWow, nSigh, nLove, nHaha, nGrrr) "
                  "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
        param = (post_id, social_name, pubblication_datetime, caption, n_like, n_wow, n_sigh, n_love, n_haha, n_grrr)
        self.cursor.execute(insert, param)
        self.conn.commit()
    
    
    def insert_social_comment(self, comment_id, pubblication_datetime, content, n_like, reply_to, post_id, analysis_id):
        """
        Inserisce un commento facebook/instagram nel db.
        """
        insert = ("INSERT INTO postComments (commentId, commentDatetime, content, nLike, replyTo, postK, analysisK) "
                  "VALUES (%s, %s, %s, %s, %s, %s, %s)")
        param = (comment_id, pubblication_datetime, content, n_like, reply_to, post_id, analysis_id)
        self.cursor.execute(insert, param)
        self.conn.commit()


    def insert_paragraph(self, paragraph_number, analysis_id, text, sentiment, sentiment_intensity):
        """
        Inserisce il paragrafo di un testo con la sua sentiment analysis nel db.
        """
        insert = ("INSERT INTO paragraphs (paragraphNumber, analysisK, content, paragraphSentiment, paragraphSentimentIntensity) "
                  "VALUES (%s, %s, %s, %s, %s)")
        param = (paragraph_number, analysis_id, text, sentiment, sentiment_intensity)
        self.cursor.execute(insert, param)
        self.conn.commit()

    