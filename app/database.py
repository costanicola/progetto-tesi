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
        """
        Connette il db al programma attraverso il modulo "mysql.connector".
        """
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


    def get_all_keywords_categories(self):
        """
        Restituisce tutte le categorie delle parole chiave.
        """
        select = ("SELECT categoryId, categoryName "
                  "FROM keywordscategories")
        self.cursor.execute(select)
        return self.cursor.fetchall()


    def get_all_keywords_sentiment_quantities(self):
        """
        Restituisce tutte le parole chiave del db, il totale dei sentiment nelle loro ricorrenze nelle analisi e la categoria di appartenenza.
        """
        select = ("SELECT k.keywordId, k.keywordName, c.categoryId, c.categoryName, "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'positivo') AS totalPositives, "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'neutrale') AS totalNeutrals, "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'negativo') AS totalNegatives "
                  "FROM attendances a RIGHT JOIN keywords k ON (a.keywordK = k.keywordId) JOIN keywordsCategories c ON (k.categoryK = c.categoryId) "
                  "GROUP BY k.keywordId, k.keywordName, c.categoryId, c.categoryName "
                  "ORDER BY c.categoryId")
        self.cursor.execute(select)
        return self.cursor.fetchall()


    def get_keyword_synonyms(self, keyword_id):
        """
        Restituisce i sinonimi/parole simili di una certa parola chiave.
        """
        select = ("SELECT synonymName "
                  "FROM keywordssynonyms "
                  "WHERE keywordK = %s")
        param = (keyword_id, )
        self.cursor.execute(select, param)
        return self.cursor.fetchall()


    def get_keyword_total_sentiment_quantities(self, keyword_id):
        """
        Restituisce il totale (documenti + socials) dei tre sentiment di una certa keyword.
        """
        select = ("SELECT "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'positivo') AS positivi, "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'neutrale') AS neutrali, "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'negativo') AS negativi "
                  "FROM attendances a RIGHT JOIN keywords k ON (a.keywordK = k.keywordId) "
                  "WHERE k.keywordId = %s "
                  "GROUP BY positivi, neutrali, negativi")
        param = (keyword_id, )
        self.cursor.execute(select, param)
        return self.cursor.fetchone()


    def get_keyword_document_sentiment_quantities(self, keyword_id):
        """
        Restituisce il conteggio dei tre sentiment di una certa keyword presente nei documenti della Darsena (quelli inseriti dagli utenti).
        """
        select = ("SELECT "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t1 ON (a1.analysisK = t1.analysisId) WHERE a1.keywordK = k.keywordId AND t1.sentiment = 'positivo') AS positivi, "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t1 ON (a1.analysisK = t1.analysisId) WHERE a1.keywordK = k.keywordId AND t1.sentiment = 'neutrale') AS neutrali, "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t1 ON (a1.analysisK = t1.analysisId) WHERE a1.keywordK = k.keywordId AND t1.sentiment = 'negativo') AS negativi "
                  "FROM attendances a RIGHT JOIN keywords k ON (a.keywordK = k.keywordId) JOIN textanalysis t ON (a.analysisK = t.analysisId) "
                  "WHERE k.keywordId = %s AND t.userK IS NOT NULL "
                  "GROUP BY positivi, neutrali, negativi")
        param = (keyword_id, )
        self.cursor.execute(select, param)
        return self.cursor.fetchone()


    def get_keyword_social_sentiment_quantities(self, keyword_id, social_name):
        """
        Restituisce il conteggio dei tre sentiment di una certa keyword presente su un certo social.
        """
        select = ("SELECT "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'positivo') AS positivi, "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'neutrale') AS neutrali, "
                  "(SELECT COUNT(*) FROM attendances a1 JOIN textanalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'negativo') AS negativi "
                  "FROM attendances a RIGHT JOIN keywords k ON (a.keywordK = k.keywordId) JOIN textanalysis t ON (a.analysisK = t.analysisId) JOIN postcomments p ON (t.analysisId = p.analysisK) JOIN socialposts s ON (p.postK = s.postId) "
                  "WHERE k.keywordId = %s AND s.socialName = %s "
                  "GROUP BY positivi, neutrali, negativi")
        param = (keyword_id, social_name)
        self.cursor.execute(select, param)
        return self.cursor.fetchone()


    def get_keyword_sentiment_quantities_through_time(self, keyword_id):
        """
        Restituisce i tre sentiment suddivisi per data di una certa keyword.
        """
        select = ("SELECT t.analysisAddedDate, "
                  "(SELECT COUNT(*) FROM textanalysis t1 JOIN attendances a ON (t1.analysisId = a.analysisK) WHERE t1.analysisAddedDate = t.analysisAddedDate AND a.keywordK = %s AND t1.sentiment = 'positivo') AS totalPositives, "
                  "(SELECT COUNT(*) FROM textanalysis t1 JOIN attendances a ON (t1.analysisId = a.analysisK) WHERE t1.analysisAddedDate = t.analysisAddedDate AND a.keywordK = %s AND t1.sentiment = 'neutrale') AS totalNeutrals, "
                  "(SELECT COUNT(*) FROM textanalysis t1 JOIN attendances a ON (t1.analysisId = a.analysisK) WHERE t1.analysisAddedDate = t.analysisAddedDate AND a.keywordK = %s AND t1.sentiment = 'negativo') AS totalNegatives "
                  "FROM textanalysis t "
                  "GROUP BY t.analysisAddedDate "
                  "HAVING (totalPositives + totalNeutrals + totalNegatives) <> 0 "
                  "ORDER BY t.analysisAddedDate")
        param = (keyword_id, keyword_id, keyword_id)
        self.cursor.execute(select, param)
        return self.cursor.fetchall()


    def insert_new_keyword(self, keyword_name, category_name, synonyms):
        """
        Inserisce una nuova parola chiave di una determinata categoria ed anche i suoi sinonimi nel db. DA FINIREeEeEeEeEeEeEeEeEeEeE
        """
        select = ("SELECT categoryId "
                  "FROM keywordsCategories "
                  "WHERE categoryName = %s")
        param = (category_name, )
        self.cursor.execute(select, param)
        category_id = self.cursor.fetchone()["categoryId"]
        
        insert = ("INSERT INTO keywords (keywordName, categoryK) "
                  "VALUES (%s, %s)")
        param = (keyword_name, category_id)
        self.cursor.execute(insert, param)
        self.conn.commit()
        
        insert = ("INSERT INTO keywordsSynonyms (synonymName, keywordK) "
                  "VALUES ()")
        
        