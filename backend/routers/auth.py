"""
routers/auth.py — Authentication Endpoints
==========================================
Endpoints for signup, login, and email verification.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import uuid
from datetime import datetime, timezone, timedelta
import random
import string

from database import get_db
from models.user import User
from schemas.auth import UserCreate, UserLogin, VerifyOTP, Token, UserResponse
from services.auth_service import get_password_hash, verify_password, create_access_token, decode_access_token
from utils.email import send_otp_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Dependency to get the current authenticated user."""
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return user

def require_role(role: str):
    """Dependency factory for role-based access control."""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role != role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Operation not permitted. Requires role: {role}"
            )
        return current_user
    return role_checker

@router.post("/signup", response_model=dict)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_pwd = get_password_hash(user_data.password)
    otp_code = ''.join(random.choices(string.digits, k=6))
    
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_pwd,
        name=user_data.name,
        role=user_data.role,
        otp_code=otp_code,
        otp_expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Send OTP email
    email_sent = send_otp_email(new_user.email, otp_code)
    if not email_sent:
        # We could rollback the user creation here if we wanted strict consistency
        raise HTTPException(status_code=500, detail="Account created, but failed to send the OTP email. Please check server logs.")
    
    return {"message": "Verification code sent to your email."}

@router.post("/verify-otp", response_model=Token)
def verify_otp(verify_data: VerifyOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == verify_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.is_verified:
        raise HTTPException(status_code=400, detail="User is already verified")
        
    if user.otp_code != verify_data.otp_code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    now = datetime.now(timezone.utc)
    expires_at = user.otp_expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
        
    if not expires_at or now > expires_at:
        raise HTTPException(status_code=400, detail="Verification code has expired")
        
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        
    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Please verify your email before logging in")
        
    # Create token payload
    access_token = create_access_token(
        data={"sub": user.id, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
