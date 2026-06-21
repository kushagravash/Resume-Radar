"""
main.py — FastAPI Application Entry Point
==========================================
Initializes the FastAPI application, sets up CORS middleware,
registers lifespan events (for DB creation and model loading),
and includes all routers.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from database import create_tables

import nltk

# Programmatically ensure required NLTK resources are available locally
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

# Set up logging early
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events run before the server starts and after it stops.
    """
    # 1. Ensure database tables exist
    create_tables()

    # 2. Trigger async download/loading of the ML model
    # By importing the embedding service, the global SentenceTransformer
    # instance will be initialized. If the model isn't cached, it downloads now.
    logger.info("Initializing ML models...")
    try:
        from services.embedding_service import get_model
        get_model()
        logger.info("ML models ready.")
    except Exception as e:
        logger.error(f"Failed to load ML models: {e}")
        # In a real production app, we might raise here to prevent startup
        # if the ML service is totally broken.

    yield  # Server is running

    logger.info("Shutting down application...")


app = FastAPI(
    title="Resume Radar API",
    description="Backend for Resume Radar — Intelligent candidate matching.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS Configuration ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routers Inclusion ─────────────────────────────────────────────────────────
from routers import auth, jobs, recruiter, candidate

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(recruiter.router)
app.include_router(candidate.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok", "environment": settings.APP_ENV}
