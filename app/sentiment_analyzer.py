# -*- coding: utf-8 -*-
"""
Created on Fri Oct 21 15:50:21 2022
@author: Nicola
"""

from happytransformer import HappyTextClassification


def translate_result(result):
    if result == "positive" or result == "POS":
        return "positivo"
    elif result == "negative" or result == "NEG":
        return "negativo"
    elif result == "neutral" or result == "NEU":
        return "neutrale"
    elif result == "anger":
        return "rabbia"
    elif result == "joy":
        return "gioia"
    elif result == "fear":
        return "paura"
    elif result == "sadness":
        return "tristezza"
    elif result == "surprise":
        return "stupore"
    else:
        return "disgusto"


class Sentiment():
    
    def __init__(self):
        self.classificator_ita = HappyTextClassification(model_type="BERT", model_name="neuraly/bert-base-italian-cased-sentiment", num_labels=3)
        self.classificator_eng = HappyTextClassification(model_type="BERT", model_name="finiteautomata/bertweet-base-sentiment-analysis", num_labels=3)

    def get_sentiment_ita(self, text):
        result = self.classificator_ita.classify_text(text)
        return translate_result(result.label), int(result.score * 100)
    
    def get_sentiment_eng(self, text):
        result = self.classificator_eng.classify_text(text)
        return translate_result(result.label), int(result.score * 100)


class Emotion():
    
    def __init__(self):
        self.classificator_ita = HappyTextClassification(model_type="BERT", model_name="MilaNLProc/feel-it-italian-emotion", num_labels=4)
        self.classificator_eng = HappyTextClassification(model_type="DISTILROBERTA", model_name="j-hartmann/emotion-english-distilroberta-base", num_labels=7)
        
    def get_emotion_ita(self, text):
        result = self.classificator_ita.classify_text(text)
        return translate_result(result.label), int(result.score * 100)
    
    def get_emotion_eng(self, text):
        result = self.classificator_eng.classify_text(text)
        return translate_result(result.label), int(result.score * 100)
