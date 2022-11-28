# -*- coding: utf-8 -*-
"""
Created on Mon Oct 31 14:49:28 2022
@author: Nicola
"""

import mysql.connector
from datetime import datetime
    

conn = mysql.connector.connect(user="root", password="maisciquel", host="127.0.0.1", database="thesisdb")
cursor = conn.cursor(dictionary=True, buffered=True)


def get_documents_sentiment_quantities():
    """
    Restituisce il numero di documenti della Darsena positivi, negativi e neutrali.
    """
    select = ("SELECT sentiment, COUNT(*) AS n "
              "FROM textanalysis "
              "WHERE userK IS NOT NULL "
              "GROUP BY sentiment")
    cursor.execute(select)
    return cursor.fetchall()


def get_social_posts_count(social_name):
    """
    Restituisce il numero di post di un certo social.
    """
    select = ("SELECT IFNULL(COUNT(*), 0) AS quantity "
              "FROM socialPosts "
              "WHERE socialName = %s")
    param = (social_name, )
    cursor.execute(select, param)
    return cursor.fetchone()["quantity"]


def get_social_comments_count(social_name):
    """
    Restituisce il numero di post di un certo social.
    """
    select = ("SELECT IFNULL(COUNT(*), 0) AS quantity "
              "FROM socialPosts p JOIN postComments c ON (p.postId = c.postK) "
              "WHERE p.socialName = %s")
    param = (social_name, )
    cursor.execute(select, param)
    return cursor.fetchone()["quantity"]


def get_social_last_post_date(social_name):
    """
    Restituisce la data di pubblicazione dell'ultimo post salvato nel db di un certo social.
    """
    select = ("SELECT IFNULL(MAX(pubblicationDatetime), 0) AS lastDate "
              "FROM socialPosts "
              "WHERE socialName = %s")
    param = (social_name, )
    cursor.execute(select, param)
    return cursor.fetchone()["lastDate"]


def get_all_social_posts_preview(social_name):
    """
    Restituisce alcune informazioni di tutti i post di un certo social.
    """
    select = ("SELECT p.postId, p.pubblicationDatetime, p.caption, COUNT(commentId) AS nComments, "
              "IFNULL(p.nLike, 0) AS likes, IFNULL(p.nWow, 0) AS wow, IFNULL(p.nSigh, 0) AS sigh, IFNULL(p.nLove, 0) AS love, IFNULL(p.nHaha, 0) AS haha, IFNULL(p.nGrrr, 0) AS grrr "
              "FROM socialPosts p LEFT JOIN postComments c ON (p.postId = c.postK) "
              "WHERE p.socialName = %s "
              "GROUP BY p.postId, p.pubblicationDatetime, p.caption, p.nLike, p.nWow, p.nSigh, p.nLove, p.nHaha, p.nGrrr "
              "ORDER BY p.pubblicationDatetime DESC")
    param = (social_name, )
    cursor.execute(select, param)
    return cursor.fetchall()


def get_post_details(post_id):
    """
    Restituisce le informazioni di un certo post.
    """
    select = ("SELECT pubblicationDatetime, caption, IFNULL(nLike, 0) AS nLike, IFNULL(nWow, 0) AS nWow, IFNULL(nSigh, 0) AS nSigh, IFNULL(nLove, 0) AS nLove, IFNULL(nHaha, 0) AS nHaha, IFNULL(nGrrr, 0) AS nGrrr "
              "FROM socialPosts "
              "WHERE postId = %s")
    param = (post_id, )
    cursor.execute(select, param)
    return cursor.fetchone()


def get_post_comments_details(post_id):
    """
    Restituisce le informazioni di tutti i commenti di un certo post.
    """
    select = ("SELECT c1.commentId, c1.commentDatetime, c1.content, c1.nLike, COUNT(c2.replyTo) AS nReplies, c1.replyTo "
              "FROM postComments c1 LEFT JOIN postComments c2 ON (c1.commentId = c2.replyTo) "
              "WHERE c1.postK = %s "
              "GROUP BY c1.commentId, c1.commentDatetime, c1.content, c1.nLike "
              "ORDER BY nReplies DESC")
    param = (post_id, )
    cursor.execute(select, param)
    return cursor.fetchall()


def get_post_comments_keywords(post_id):
    """
    Restituisce le diverse parole chiave trovate nei commenti.
    """
    select = ("SELECT DISTINCT k.keywordName "
              "FROM postComments c JOIN textAnalysis t ON (c.analysisK = t.analysisId) JOIN attendances a ON (t.analysisId = a.analysisK) JOIN keywords k ON (a.keywordK = k.keywordId) "
              "WHERE postK = %s")
    param = (post_id, )
    cursor.execute(select, param)
    return cursor.fetchall()


def get_social_posts_ids(social_name):
    """
    Restituisce tutti gli id di facebook/instagram della tabella dei post. Servono per bloccare il loop delle API.
    """
    select = ("SELECT postId "
              "FROM socialPosts "
              "WHERE socialName = %s")
    param = (social_name, )
    cursor.execute(select, param)
    return cursor.fetchall()


def get_social_comments_ids(social_name):
    """
    Ritorna tutti gli id di facebook/instagram della tabella dei commenti. Servono per bloccare il loop delle API.
    """
    select = ("SELECT c.commentId "
              "FROM postComments c JOIN socialPosts p ON (c.postK = p.postId) "
              "WHERE p.socialName = %s")
    param = (social_name, )
    cursor.execute(select, param)
    return cursor.fetchall()


def insert_text_analysis(language, sentiment, sentiment_intensity, emotion=None):
    """
    Inserisce la sentiment analysis di un testo nel db e ritorna il suo id (ultimo id dell'inserimento)
    """
    insert = ("INSERT INTO textAnalysis (analysisLanguage, analysisAddedDate, sentiment, sentimentIntensity, emotion) "
              "VALUES (%s, %s, %s, %s, %s)")
    param = (language, datetime.today().strftime("%Y-%m-%d"), sentiment, sentiment_intensity, emotion)
    cursor.execute(insert, param)
    conn.commit()
    
    select = ("SELECT MAX(analysisId) AS analysisId "
              "FROM textAnalysis")
    cursor.execute(select)
    return cursor.fetchone()["analysisId"]


def insert_social_post(post_id, social_name, pubblication_datetime, caption, n_like, n_wow=None, n_sigh=None, n_love=None, n_haha=None, n_grrr=None):
    """
    Inserisce un post facebook/instagram nel db.
    """
    insert = ("INSERT INTO socialPosts (postId, socialName, pubblicationDatetime, caption, nLike, nWow, nSigh, nLove, nHaha, nGrrr) "
              "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)")
    param = (post_id, social_name, pubblication_datetime, caption, n_like, n_wow, n_sigh, n_love, n_haha, n_grrr)
    cursor.execute(insert, param)
    conn.commit()


def insert_social_comment(comment_id, pubblication_datetime, content, n_like, reply_to, post_id, analysis_id):
    """
    Inserisce un commento facebook/instagram nel db.
    """
    insert = ("INSERT INTO postComments (commentId, commentDatetime, content, nLike, replyTo, postK, analysisK) "
              "VALUES (%s, %s, %s, %s, %s, %s, %s)")
    param = (comment_id, pubblication_datetime, content, n_like, reply_to, post_id, analysis_id)
    cursor.execute(insert, param)
    conn.commit()


def insert_paragraph(paragraph_number, analysis_id, text, sentiment, sentiment_intensity):
    """
    Inserisce il paragrafo di un testo con la sua sentiment analysis nel db.
    """
    insert = ("INSERT INTO paragraphs (paragraphNumber, analysisK, content, paragraphSentiment, paragraphSentimentIntensity) "
              "VALUES (%s, %s, %s, %s, %s)")
    param = (paragraph_number, analysis_id, text, sentiment, sentiment_intensity)
    cursor.execute(insert, param)
    conn.commit()


def get_all_keywords_categories():
    """
    Restituisce tutte le categorie delle parole chiave.
    """
    select = ("SELECT categoryId, categoryName "
              "FROM keywordscategories")
    cursor.execute(select)
    return cursor.fetchall()


def get_all_keywords_sentiment_quantities():
    """
    Restituisce tutte le parole chiave del db, il totale dei sentiment nelle loro ricorrenze nelle analisi e la categoria di appartenenza.
    """
    select = ("SELECT k.keywordId, k.keywordName, c.categoryId, c.categoryName, "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'positivo') AS totalPositives, "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'neutrale') AS totalNeutrals, "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'negativo') AS totalNegatives "
              "FROM attendances a RIGHT JOIN keywords k ON (a.keywordK = k.keywordId) JOIN keywordsCategories c ON (k.categoryK = c.categoryId) "
              "GROUP BY k.keywordId, k.keywordName, c.categoryId, c.categoryName "
              "ORDER BY c.categoryId")
    cursor.execute(select)
    return cursor.fetchall()


def get_keyword_synonyms(keyword_id):
    """
    Restituisce i sinonimi/parole simili di una certa parola chiave.
    """
    select = ("SELECT synonymName "
              "FROM keywordsSynonyms "
              "WHERE keywordK = %s")
    param = (keyword_id, )
    cursor.execute(select, param)
    return cursor.fetchall()


def get_keyword_total_sentiment_quantities(keyword_id):
    """
    Restituisce il totale (documenti + socials) dei tre sentiment di una certa keyword.
    """
    select = ("SELECT "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'positivo') AS positivi, "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'neutrale') AS neutrali, "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'negativo') AS negativi "
              "FROM attendances a RIGHT JOIN keywords k ON (a.keywordK = k.keywordId) "
              "WHERE k.keywordId = %s "
              "GROUP BY positivi, neutrali, negativi")
    param = (keyword_id, )
    cursor.execute(select, param)
    return cursor.fetchone()


def get_keyword_document_sentiment_quantities(keyword_id):
    """
    Restituisce il conteggio dei tre sentiment di una certa keyword presente nei documenti della Darsena (quelli inseriti dagli utenti).
    """
    select = ("SELECT "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t1 ON (a1.analysisK = t1.analysisId) WHERE a1.keywordK = k.keywordId AND t1.sentiment = 'positivo') AS positivi, "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t1 ON (a1.analysisK = t1.analysisId) WHERE a1.keywordK = k.keywordId AND t1.sentiment = 'neutrale') AS neutrali, "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t1 ON (a1.analysisK = t1.analysisId) WHERE a1.keywordK = k.keywordId AND t1.sentiment = 'negativo') AS negativi "
              "FROM attendances a RIGHT JOIN keywords k ON (a.keywordK = k.keywordId) JOIN textAnalysis t ON (a.analysisK = t.analysisId) "
              "WHERE k.keywordId = %s AND t.userK IS NOT NULL "
              "GROUP BY positivi, neutrali, negativi")
    param = (keyword_id, )
    cursor.execute(select, param)
    return cursor.fetchone()


def get_keyword_social_sentiment_quantities(keyword_id, social_name):
    """
    Restituisce il conteggio dei tre sentiment di una certa keyword presente su un certo social.
    """
    select = ("SELECT "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'positivo') AS positivi, "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'neutrale') AS neutrali, "
              "(SELECT COUNT(*) FROM attendances a1 JOIN textAnalysis t ON (a1.analysisK = t.analysisId) WHERE a1.keywordK = k.keywordId AND t.sentiment = 'negativo') AS negativi "
              "FROM attendances a RIGHT JOIN keywords k ON (a.keywordK = k.keywordId) JOIN textAnalysis t ON (a.analysisK = t.analysisId) JOIN postcomments p ON (t.analysisId = p.analysisK) JOIN socialposts s ON (p.postK = s.postId) "
              "WHERE k.keywordId = %s AND s.socialName = %s "
              "GROUP BY positivi, neutrali, negativi")
    param = (keyword_id, social_name)
    cursor.execute(select, param)
    return cursor.fetchone()


def get_keyword_sentiment_quantities_through_time(keyword_id):
    """
    Restituisce i tre sentiment suddivisi per data di una certa keyword.
    """
    select = ("SELECT t.analysisAddedDate, "
              "(SELECT COUNT(*) FROM textAnalysis t1 JOIN attendances a ON (t1.analysisId = a.analysisK) WHERE t1.analysisAddedDate = t.analysisAddedDate AND a.keywordK = %s AND t1.sentiment = 'positivo') AS totalPositives, "
              "(SELECT COUNT(*) FROM textAnalysis t1 JOIN attendances a ON (t1.analysisId = a.analysisK) WHERE t1.analysisAddedDate = t.analysisAddedDate AND a.keywordK = %s AND t1.sentiment = 'neutrale') AS totalNeutrals, "
              "(SELECT COUNT(*) FROM textAnalysis t1 JOIN attendances a ON (t1.analysisId = a.analysisK) WHERE t1.analysisAddedDate = t.analysisAddedDate AND a.keywordK = %s AND t1.sentiment = 'negativo') AS totalNegatives "
              "FROM textAnalysis t "
              "GROUP BY t.analysisAddedDate "
              "HAVING (totalPositives + totalNeutrals + totalNegatives) <> 0 "
              "ORDER BY t.analysisAddedDate")
    param = (keyword_id, keyword_id, keyword_id)
    cursor.execute(select, param)
    return cursor.fetchall()


def insert_new_keyword(keyword_name, category_name, synonyms):
    """
    Inserisce una nuova parola chiave di una determinata categoria ed anche i suoi sinonimi nel db. DA FINIREeEeEeEeEeEeEeEeEeEeE
    """
    select = ("SELECT categoryId "
              "FROM keywordsCategories "
              "WHERE categoryName = %s")
    param = (category_name, )
    cursor.execute(select, param)
    category_id = cursor.fetchone()["categoryId"]
    
    insert = ("INSERT INTO keywords (keywordName, categoryK) "
              "VALUES (%s, %s)")
    param = (keyword_name, category_id)
    cursor.execute(insert, param)
    conn.commit()
    
    insert = ("INSERT INTO keywordsSynonyms (synonymName, keywordK) "
              "VALUES ()")
        
        