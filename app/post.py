# -*- coding: utf-8 -*-
"""
Created on Tue Nov  1 14:14:14 2022
@author: Nicola
"""

class Post():
    
    def __init__(self, pid, created_time, text, insights):
        self.id = pid
        self.created_time = created_time
        self.text = text
        self.like_count = insights["like"] if "like" in insights else None
        self.wow_count = insights["wow"] if "wow" in insights else None
        self.sigh_count = insights["sorry"] if "sorry" in insights else None
        self.love_count = insights["love"] if "love" in insights else None
        self.haha_count = insights["haha"] if "haha" in insights else None
        self.grrr_count = insights["anger"] if "anger" in insights else None
    
    def get_id(self):
        return self.id
    
    def get_created_time(self):
        return self.created_time
    
    def get_text(self):
        return self.text
    
    def get_like_count(self):
        return self.like_count
        
    def get_wow_count(self):
        return self.wow_count
        
    def get_sigh_count(self):
        return self.sigh_count
        
    def get_love_count(self):
        return self.love_count
        
    def get_haha_count(self):
        return self.haha_count
        
    def get_grrr_count(self):
        return self.grrr_count