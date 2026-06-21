"""
utils/security.py — Security Utilities
======================================
Contains functions for sanitizing input, particularly filenames,
to prevent directory traversal attacks and ensure safe processing.
Also handles MIME type detection via filetype.
"""

import re
import filetype
from fastapi import UploadFile, HTTPException

def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename by removing all characters except alphanumeric,
    dots, dashes, and underscores. Prevents directory traversal (e.g. '../../')
    """
    if not filename:
        return "unnamed_file"
    # Keep only safe characters
    sanitized = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    # Prevent completely empty names after sanitization
    return sanitized if sanitized else "unnamed_file"

def validate_file_type(file_bytes: bytes, filename: str) -> str:
    """
    Validate file using magic bytes, not just the extension.
    Raises HTTPException if the file is not supported.
    Returns the detected extension/type.
    """
    kind = filetype.guess(file_bytes)
    
    # We support PDF, DOCX, PNG, JPG/JPEG, and plain text
    allowed_mimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg"
    ]
    
    # filetype might return None for plain text files
    if kind is None:
        # Check if it's a valid text file by trying to decode a snippet
        try:
            file_bytes[:512].decode('utf-8')
            if filename.lower().endswith('.txt'):
                 return "text/plain"
        except UnicodeDecodeError:
            pass
        raise HTTPException(status_code=400, detail="Unsupported file format or unreadable content.")
        
    if kind.mime not in allowed_mimes:
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {kind.mime}")
        
    return kind.mime
