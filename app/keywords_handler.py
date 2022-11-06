# -*- coding: utf-8 -*-
"""
Created on Thu Oct 27 21:32:08 2022
@author: Nicola
"""

import csv

class KeywordsHandler():
    
    def __init__(self):
        
        # dizionari con k la parola principale e v una lista di parole simili
        self.keywords_darsena_verde = dict()
        self.keywords_k = dict()

        with open("static/keywords/darsena-verde.txt", encoding="utf-8") as f:
            for line in f:
                keyword = line.lower().strip().split(", ")
                self.keywords_darsena_verde[keyword[0]] = keyword[1:]
                
        with open("static/keywords/k.txt", encoding="utf-8") as f:
            for line in f:
                keyword = line.lower().strip().split(", ")
                self.keywords_k[keyword[0]] = keyword[1:]
        
        
    def get_keywords_darsena_verde_dict(self):
        return self.keywords_darsena_verde
    
    
    def get_keywords_k_dict(self):
        return self.keywords_k
    
    
    def save_darsena_verde_match(self, row_list):
        with open("static/keywords/darsena-verde-result.csv", "a", newline="") as f:
            csvwriter = csv.writer(f)
            csvwriter.writerow(row_list)
    
    def save_k_match(self, row_list):
        with open("static/keywords/k-result.csv", "a", newline="") as f:
            csvwriter = csv.writer(f)
            csvwriter.writerow(row_list)