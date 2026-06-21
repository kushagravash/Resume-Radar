"""
routers/jobs.py — Job Endpoints
===============================
Endpoints for recruiters to create and view jobs, and candidates to browse them.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.job import JobPosting
from models.user import User
from schemas.job import JobCreate, JobResponse
from routers.auth import get_current_user, require_role

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

@router.get("/", response_model=List[JobResponse])
def get_jobs(db: Session = Depends(get_db)):
    """Publicly accessible list of all jobs."""
    jobs = db.query(JobPosting).all()
    return jobs

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: str, db: Session = Depends(get_db)):
    job = db.query(JobPosting).filter(JobPosting.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_data: JobCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recruiter"))
):
    """Only recruiters can create jobs."""
    new_job = JobPosting(
        title=job_data.title,
        description=job_data.description,
        recruiter_id=current_user.id
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job
