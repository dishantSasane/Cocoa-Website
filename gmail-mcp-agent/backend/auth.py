"""
Authentication utilities for the web app.
Handles password hashing and session cookie signing.
"""

import os
import bcrypt
from itsdangerous import URLSafeTimedSerializer
from dotenv import load_dotenv

load_dotenv()


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its hash."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def get_serializer():
    """Get the session serializer using SESSION_SECRET from env."""
    secret = os.getenv("SESSION_SECRET")
    if not secret:
        raise RuntimeError("SESSION_SECRET not set in .env file")
    return URLSafeTimedSerializer(secret)


def create_session_token(user_id: str) -> str:
    """Create a signed session token for a user."""
    serializer = get_serializer()
    max_age = int(os.getenv("SESSION_MAX_AGE_MINUTES", "720")) * 60  # Convert to seconds
    return serializer.dumps(user_id, salt="session-cookie")


def verify_session_token(token: str) -> str | None:
    """
    Verify a session token and return the user_id if valid.
    Returns None if invalid or expired.
    """
    serializer = get_serializer()
    max_age = int(os.getenv("SESSION_MAX_AGE_MINUTES", "720")) * 60  # Convert to seconds

    try:
        user_id = serializer.loads(
            token,
            salt="session-cookie",
            max_age=max_age
        )
        return user_id
    except Exception:
        return None
