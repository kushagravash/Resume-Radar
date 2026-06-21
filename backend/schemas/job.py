"""
schemas/job.py — Job Pydantic Schemas
=====================================
Defines input validation and output formatting for job endpoints.
"""

from pydantic import BaseModel, Field
from datetime import datetime

class JobCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10)

class JobResponse(BaseModel):
    id: str
    recruiter_id: str
    title: str
    description: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
