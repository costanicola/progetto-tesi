from happytransformer import HappyTextClassification

# modelli per SENTIMENT ANALYSIS
sentiment_classificator_ita = HappyTextClassification(model_type="BERT", model_name="neuraly/bert-base-italian-cased-sentiment", num_labels=3)
sentiment_classificator_eng = HappyTextClassification(model_type="BERT", model_name="finiteautomata/bertweet-base-sentiment-analysis", num_labels=3)

# modelli per EMOTION/FEEL ANALYSIS
emotion_classificator_ita = HappyTextClassification(model_type="BERT", model_name="MilaNLProc/feel-it-italian-emotion", num_labels=4)
emotion_classificator_eng = HappyTextClassification(model_type="DISTILROBERTA", model_name="j-hartmann/emotion-english-distilroberta-base", num_labels=7)


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


def get_sentiment_ita(text):
    result = sentiment_classificator_ita.classify_text(text)
    return translate_result(result.label), int(result.score * 100)
    
def get_sentiment_eng(text):
    result = sentiment_classificator_eng.classify_text(text)
    return translate_result(result.label), int(result.score * 100)


def get_emotion_ita(text):
    result = emotion_classificator_ita.classify_text(text)
    return translate_result(result.label), int(result.score * 100)
    
def get_emotion_eng(text):
    result = emotion_classificator_eng.classify_text(text)
    return translate_result(result.label), int(result.score * 100)


def get_possible_sentiment_results():
    return ["positivo", "neutrale", "negativo"]

def get_possible_emotion_result():
    return ["neutrale", "disgusto", "rabbia", "gioia", "paura", "tristezza", "stupore"]