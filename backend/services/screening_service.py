"""
services/screening_service.py — AI Pipeline Execution
=====================================================
Orchestrates the 5-step pipeline: extraction -> cleaning -> embedding -> similarity.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List

from services.nlp_service import clean_text, extract_keywords
from services.embedding_service import get_embedding

def calculate_similarity_score(resume_text: str, jd_text: str) -> float:
    """
    Calculates the cosine similarity percentage between a resume and a job description.
    """
    # 1. Clean both texts
    clean_resume = clean_text(resume_text)
    clean_jd = clean_text(jd_text)
    
    if not clean_resume or not clean_jd:
        return 0.0
        
    # 2. Get embeddings
    resume_emb = get_embedding(clean_resume)
    jd_emb = get_embedding(clean_jd)
    
    # 3. Calculate cosine similarity
    # cosine_similarity expects 2D arrays: [[features]]
    res_2d = resume_emb.reshape(1, -1)
    jd_2d = jd_emb.reshape(1, -1)
    
    similarity = cosine_similarity(res_2d, jd_2d)[0][0]
    
    # 4. Convert to percentage (0 to 100)
    score_percentage = round(float(similarity) * 100, 2)
    
    # Ensure it's between 0 and 100
    return max(0.0, min(100.0, score_percentage))

def generate_insights(resume_text: str, jd_text: str, score: float) -> tuple[List[str], List[str]]:
    """
    Generates a simple list of matching keywords (strengths) and missing keywords (gaps).
    """
    resume_kw = set(extract_keywords(resume_text))
    jd_kw = set(extract_keywords(jd_text))
    
    # Matching keywords
    strengths = list(resume_kw.intersection(jd_kw))
    
    # Missing keywords (present in JD, missing in resume)
    gaps = list(jd_kw.difference(resume_kw))
    
    # Sort and limit for brevity
    return sorted(strengths)[:10], sorted(gaps)[:10]
