"""
routers/candidate.py — Candidate Action Endpoints
=================================================
Endpoints for candidates to upload their resume and get feedback.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import traceback

from database import get_db
from models.user import User
from models.job import JobPosting
from schemas.screening import CandidateFeedback
from routers.auth import require_role
from utils.security import sanitize_filename, validate_file_type
from config import get_settings
from services.file_service import extract_text_from_bytes
from services.screening_service import calculate_similarity_score, generate_insights

router = APIRouter(prefix="/api/candidate", tags=["Candidate Actions"])
settings = get_settings()

@router.post("/jobs/{job_id}/apply", response_model=CandidateFeedback)
async def apply_and_get_feedback(
    job_id: str,
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("candidate"))
):
    """
    Candidate uploads a single resume. Returns score, strengths, gaps, and suggestions.
    """
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
         raise HTTPException(status_code=404, detail="Job not found")

    try:
        file_bytes = await resume.read()
        if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
             raise HTTPException(status_code=400, detail="File too large")

        mime_type = validate_file_type(file_bytes, resume.filename)
        resume_text = extract_text_from_bytes(file_bytes, mime_type)
        
        score = calculate_similarity_score(resume_text, job.description)
        strengths, gaps = generate_insights(resume_text, job.description, score)
        
        if score > 70:
            suggestion = "You are a strong match for this role! Consider highlighting your recent projects."
        elif score > 40:
            suggestion = "You have some relevant skills, but there are gaps. Try tailoring your resume further."
        else:
            suggestion = "Your resume does not strongly align with the job description. Consider reviewing the requirements."

        safe_filename = sanitize_filename(resume.filename)

        return CandidateFeedback(
            filename=safe_filename,
            job_title=job.title,
            match_score=score,
            strengths=strengths,
            gaps=gaps,
            suggestion=suggestion
        )
        
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")
