"""
schemas/screening.py — Screening Pydantic Schemas
=================================================
Defines output formatting for AI screening results.
"""

from pydantic import BaseModel
from typing import List

class RecruiterScreeningResult(BaseModel):
    filename: str
    candidate_name: str  # Extracted or default
    match_score: float   # 0.0 to 100.0
    matched_keywords: List[str]
    summary: str

class CandidateFeedback(BaseModel):
    filename: str
    job_title: str
    match_score: float   # 0.0 to 100.0
    strengths: List[str]
    gaps: List[str]
    suggestion: str
