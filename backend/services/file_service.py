"""
services/file_service.py — File Processing & Extraction
=======================================================
Extracts text from PDF, DOCX, and images entirely in-memory.
"""

import io
from PIL import Image
import PyPDF2
import docx
import pytesseract
from fastapi import HTTPException

# Configure pytesseract path if on Windows
# import sys
# if sys.platform == "win32":
#     pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_bytes(file_bytes: bytes, mime_type: str) -> str:
    """
    Extracts text from a file stored in memory based on its MIME type.
    """
    try:
        if mime_type == "application/pdf":
            return _extract_from_pdf(file_bytes)
        elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return _extract_from_docx(file_bytes)
        elif mime_type in ["image/png", "image/jpeg"]:
            return _extract_from_image(file_bytes)
        elif mime_type == "text/plain":
            return file_bytes.decode('utf-8', errors='ignore')
        else:
            raise ValueError(f"Unsupported MIME type for extraction: {mime_type}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")

def _extract_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text.append(page_text)
    return "\n".join(text)

def _extract_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([paragraph.text for paragraph in doc.paragraphs])

def _extract_from_image(file_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(file_bytes))
        # Ensure we can read it via OCR
        text = pytesseract.image_to_string(image)
        return text
    except pytesseract.TesseractNotFoundError:
         raise HTTPException(
             status_code=500, 
             detail="Tesseract OCR is not installed or not found in PATH on the server."
         )
