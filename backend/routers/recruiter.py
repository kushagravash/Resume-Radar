"""
routers/recruiter.py — Recruiter Action Endpoints
=================================================
Endpoints for bulk resume upload and screening against a specific job posting.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import traceback

from database import get_db
from models.user import User
from models.job import JobPosting
from schemas.screening import RecruiterScreeningResult
from routers.auth import require_role
from utils.security import sanitize_filename, validate_file_type
from config import get_settings
from services.file_service import extract_text_from_bytes
from services.screening_service import calculate_similarity_score, generate_insights

router = APIRouter(prefix="/api/recruiter", tags=["Recruiter Actions"])
settings = get_settings()

@router.post("/jobs/{job_id}/screen", response_model=List[RecruiterScreeningResult])
async def bulk_screen_resumes(
    job_id: str,
    resumes: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):
    """
    Bulk uploads multiple resumes, extracts text in memory, 
    and ranks them against the job description.
    """
    # 1. Verify Job exists and belongs to recruiter
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
         raise HTTPException(status_code=404, detail="Job not found")
    if job.recruiter_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to screen for this job")
         
    jd_text = job.description
    results = []

    # 2. Process each uploaded file in memory
    for file in resumes:
        try:
            # Enforce size limit by reading into memory
            file_bytes = await file.read()
            if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
                results.append(RecruiterScreeningResult(
                    filename=file.filename,
                    candidate_name="Unknown",
                    match_score=0.0,
                    matched_keywords=[],
                    summary=f"File exceeds maximum size limit of {settings.MAX_FILE_SIZE_BYTES} bytes."
                ))
                continue

            # Validate and Extract
            mime_type = validate_file_type(file_bytes, file.filename)
            resume_text = extract_text_from_bytes(file_bytes, mime_type)
            
            # 3. Calculate Score and Insights
            score = calculate_similarity_score(resume_text, jd_text)
            strengths, _ = generate_insights(resume_text, jd_text, score)
            
            # Simple summary generation based on matching
            if score > 75:
                summary = "Strong fit. Candidate possesses many key qualifications."
            elif score > 50:
                summary = "Moderate fit. Some qualifications met, but gaps exist."
            else:
                summary = "Weak fit. Few matching qualifications found."
                
            # Attempt to guess candidate name (placeholder logic)
            safe_filename = sanitize_filename(file.filename)
            candidate_name = safe_filename.replace('_', ' ').split('.')[0].title()

            results.append(RecruiterScreeningResult(
                filename=safe_filename,
                candidate_name=candidate_name,
                match_score=score,
                matched_keywords=strengths,
                summary=summary
            ))
            
        except Exception as e:
            # Log error internally, but don't fail the whole batch for one bad file
            traceback.print_exc()
            results.append(RecruiterScreeningResult(
                filename=file.filename if file else "Unknown",
                candidate_name="Error",
                match_score=0.0,
                matched_keywords=[],
                summary=f"Failed to process file: {str(e)}"
            ))

    # 4. Rank results by score descending
    results.sort(key=lambda x: x.match_score, reverse=True)
    return results
