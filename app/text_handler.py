import emoji #https://github.com/carpedm20/emoji

# ritorna una lista di paragrafi
def split_text_into_paragraphs(text):
    paragraphs = text.split("\n\n")
    return [p for p in paragraphs if p.strip()]


# spezza il paragrafo in frasi da 50 parole -> è necessario perchè a volte, se un testo è troppo lungo, si riceve un RuntimeError dai classificatori di Sentiment Analysis
def split_paragraph(paragraph):
    words = paragraph.split()
    n = 50
    return [' '.join(words[w: w + n]) for w in range(0, len(words), n)]


#traduttore di emoji: es. 😃 => :faccina_con_un_gran_sorriso_e_occhi_spalancati: => <faccina con un gran sorriso e occhi spalancati>
def convert_emoji_ita(text):
    return emoji.demojize(text, language="it", delimiters=(" <", "> ")).replace("_", " ")

def convert_emoji_eng(text):
    return emoji.demojize(text, delimiters=(" <", "> ")).replace("_", " ")