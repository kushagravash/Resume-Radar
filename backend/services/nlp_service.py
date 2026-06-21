"""
services/nlp_service.py — Text Preprocessing
============================================
Cleans and normalizes text for embedding creation using NLTK.
"""

import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer

# Download necessary NLTK data on first run
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('tokenizers/punkt_tab') # Might be needed in newer NLTK
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    nltk.download('wordnet', quiet=True)

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def clean_text(text: str) -> str:
    """
    Cleans raw text by lowering case, removing special characters,
    tokenizing, removing stop words, and lemmatizing.
    """
    if not text:
        return ""
        
    # 1. Lowercase
    text = text.lower()
    
    # 2. Remove special characters and digits (keep only letters)
    text = re.sub(r'[^a-z\s]', ' ', text)
    
    # 3. Tokenize
    tokens = word_tokenize(text)
    
    # 4. Remove stop words and lemmatize
    cleaned_tokens = [
        lemmatizer.lemmatize(word) 
        for word in tokens 
        if word not in stop_words and len(word) > 1
    ]
    
    return " ".join(cleaned_tokens)

def extract_keywords(text: str) -> list[str]:
    """
    Extracts a simplified list of keywords (e.g., for summary).
    This is a basic implementation.
    """
    cleaned = clean_text(text)
    # Return unique words as keywords
    return list(set(cleaned.split()))
