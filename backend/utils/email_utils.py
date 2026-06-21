"""
utils/email_utils.py — Email Simulation
=======================================
Simulates sending an email verification link to the user.
In development, this simply logs the verification URL to the console.
"""

import logging
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def send_verification_email(email: str, token: str, name: str = "User"):
    """
    Simulates sending an email. The token provided should be the
    verification token generated during signup.
    """
    verification_url = f"{settings.VERIFY_BASE_URL}/api/auth/verify?token={token}"
    
    # In a real app, you would use an SMTP client (like smtplib or a service
    # like SendGrid/AWS SES) here to send the email.
    
    msg = f"""
============================================================
  [SIMULATED EMAIL VERIFICATION]
  To: {email}
  Hi {name}, please verify your email by clicking the link below:

  {verification_url}
============================================================
"""
    logger.info(msg)
    print(msg) # Ensure it prints to terminal even if logging is misconfigured
