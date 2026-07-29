"""
One-time setup script to create password hash and session secret.
Run this once before starting the web app.
"""

import os
import secrets
from dotenv import load_dotenv, set_key
from backend.auth import hash_password


def setup_auth():
    """Set up authentication credentials."""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")

    print("=" * 60)
    print("Gmail MCP Agent - Authentication Setup")
    print("=" * 60)
    print()

    # Get password from user
    while True:
        password = input("Enter a password for the web app: ").strip()
        if not password:
            print("Password cannot be empty. Please try again.")
            continue

        confirm = input("Confirm password: ").strip()
        if password != confirm:
            print("Passwords do not match. Please try again.")
            continue

        break

    # Generate session secret
    session_secret = secrets.token_urlsafe(32)

    # Hash the password
    password_hash = hash_password(password)

    # Load existing .env or create new one
    if os.path.exists(env_path):
        load_dotenv(env_path)

    # Update .env file
    set_key(env_path, "APP_PASSWORD_HASH", password_hash)
    set_key(env_path, "SESSION_SECRET", session_secret)

    # Keep ANTHROPIC_API_KEY if it exists
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_key:
        print("\nNote: ANTHROPIC_API_KEY not found in .env")
        print("Please add it manually or run: echo 'ANTHROPIC_API_KEY=sk-ant-...' >> .env")

    print()
    print("=" * 60)
    print("Setup complete!")
    print("=" * 60)
    print()
    print(f"Password hash saved to: {env_path}")
    print(f"Session secret generated (kept private)")
    print()
    print("You can now run the web app with:")
    print("  uvicorn backend.server:app --reload --port 8000")
    print()
    print("If you need to change your password later, just run this script again.")


if __name__ == "__main__":
    setup_auth()
