# -*- coding: utf-8 -*-
"""
Created on Tue Nov  1 14:32:56 2022
@author: Nicola
"""

class Comment():
    
    def __init__(self, cid, created_time, text, like_count, post_related_id, reply_to_id=None):
        self.id = cid
        self.created_time = created_time
        self.text = text
        self.like_count = like_count
        self.post_related_id = post_related_id
        self.reply_to_id = reply_to_id
        
    def get_id(self):
        return self.id
    
    def get_created_time(self):
        return self.created_time
    
    def get_text(self):
        return self.text
    
    def get_like_count(self):
        return self.like_count
    
    def get_post_related_id(self):
        return self.post_related_id
    
    def get_reply_to_id(self):
        return self.reply_to_id