"""
services/embedding_service.py — Transformer Model Wrapper
=========================================================
Loads and caches the SentenceTransformer model to generate text embeddings.
Downloads the model automatically on first run.
"""

import logging
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List

logger = logging.getLogger(__name__)

# Global variable to hold the loaded model
_model = None
MODEL_NAME = "all-MiniLM-L6-v2"

def get_model() -> SentenceTransformer:
    """
    Returns the loaded SentenceTransformer model.
    Loads it exactly once into the global `_model` variable.
    """
    global _model
    if _model is None:
        logger.info(f"Loading SentenceTransformer model: {MODEL_NAME}")
        logger.info("If this is the first run, the model will download from Hugging Face (~80MB).")
        # Instantiate the model. This will download and cache it locally if not present.
        _model = SentenceTransformer(MODEL_NAME)
        logger.info("Model loaded successfully.")
    return _model

def get_embedding(text: str) -> np.ndarray:
    """
    Generates an embedding vector for a single string.
    Returns a numpy array.
    """
    if not text.strip():
        # Return a zero vector of appropriate size if empty
        return np.zeros(384) # all-MiniLM-L6-v2 uses 384 dimensions
        
    model = get_model()
    # encode() returns a numpy array by default
    embedding = model.encode([text])[0]
    return embedding

def get_embeddings(texts: List[str]) -> List[np.ndarray]:
    """
    Generates embeddings for a list of strings efficiently.
    """
    if not texts:
        return []
    model = get_model()
    embeddings = model.encode(texts)
    return list(embeddings)
