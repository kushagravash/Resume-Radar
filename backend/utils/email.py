import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def send_otp_email(to_email: str, otp_code: str) -> bool:
    """
    Sends an OTP verification email.
    Returns True if sent successfully, False otherwise.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.error("SMTP credentials are not configured.")
        return False
        
    sender_email = settings.SMTP_USER
    sender_name = "Resume Radar Verification"
    
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Verification Code"
    msg["From"] = f"{sender_name} <{sender_email}>"
    msg["To"] = to_email

    html_content = f"""
    <html>
      <body>
        <p>Hello,</p>
        <p>Your one-time verification code is: <strong>{otp_code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>Thank you,</p>
        <p>The Resume Radar Team</p>
      </body>
    </html>
    """
    msg.attach(MIMEText(html_content, "html"))

    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(sender_email, to_email, msg.as_string())
        server.quit()
        logger.info(f"OTP email successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {str(e)}")
        return False
