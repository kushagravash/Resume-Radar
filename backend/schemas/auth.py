"""
schemas/auth.py — Authentication Pydantic Schemas
=================================================
Defines input validation and output formatting for auth endpoints.
"""

from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(recruiter|candidate)$")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str
    is_verified: bool

    model_config = {"from_attributes": True}
