# -*- coding: utf-8 -*-
"""
Created on Wed Oct 26 19:39:13 2022
@author: Nicola
"""

import emoji #https://github.com/carpedm20/emoji

# ritorna una lista di paragrafi
def split_text_into_paragraphs(text):
    paragraphs = text.split("\n\n")
    return [p for p in paragraphs if p.strip()]


# spezza il paragrafo in frasi da 200 parole
def split_paragraph(paragraph):
    words = paragraph.split()
    n = 200
    return [' '.join(words[w: w + n]) for w in range(0, len(words), n)]


#traduttore di emoji: es. 😃 => :faccina_con_un_gran_sorriso_e_occhi_spalancati: => <faccina con un gran sorriso e occhi spalancati>
def convert_emoji_ita(text):
    return emoji.demojize(text, language="it", delimiters=(" <", "> ")).replace("_", " ")


def convert_emoji_eng(text):
    return emoji.demojize(text, delimiters=(" <", "> ")).replace("_", " ")