"""
MCP Server that exposes Gmail as tools.
Supports: list_emails, get_email_body, create_email_draft, send_last_draft, discard_last_draft
"""

import os
import base64
from email.mime.text import MIMEText
from typing import Optional
import json

from mcp.server.fastmcp import FastMCP
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# Gmail API scopes - include compose for sending emails
SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.compose",
    "https://www.googleapis.com/auth/gmail.send",
]

mcp = FastMCP("Gmail MCP Server")

# Global state for draft management
_last_draft_id: Optional[str] = None
_last_draft_message: Optional[dict] = None


def get_gmail_service():
    """Authenticate and return Gmail API service."""
    creds_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "credentials")
    credentials_path = os.path.join(creds_dir, "credentials.json")
    token_path = os.path.join(creds_dir, "token.json")

    creds = None
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(credentials_path):
                raise RuntimeError(
                    f"credentials.json not found at {credentials_path}. "
                    "Please download it from Google Cloud Console and place it in credentials/"
                )
            flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
            creds = flow.run_local_server(port=0)

        # Save credentials for next run
        os.makedirs(creds_dir, exist_ok=True)
        with open(token_path, "w") as token:
            token.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)


def _decode_base64_url(data: str) -> str:
    """Decode URL-safe base64 encoding used by Gmail API."""
    # Add padding if needed
    padding = 4 - len(data) % 4
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data).decode("utf-8")


def _extract_plain_text(message: dict) -> str:
    """Extract plain text body from Gmail message, handling multipart structures."""
    payload = message.get("payload", {})
    parts = payload.get("parts", [])
    body = payload.get("body", {})

    # If it's a simple message with no parts
    if not parts:
        data = body.get("data", "")
        if data:
            return _decode_base64_url(data)
        return ""

    # Walk through parts to find text/plain
    for part in parts:
        mime_type = part.get("mimeType", "")
        if mime_type == "text/plain":
            data = part.get("body", {}).get("data", "")
            if data:
                return _decode_base64_url(data)
        elif mime_type == "multipart/alternative" or mime_type == "multipart/mixed":
            # Recursively search in nested parts
            text = _extract_plain_text(part)
            if text:
                return text

    # Fallback: try to get any text content
    for part in parts:
        data = part.get("body", {}).get("data", "")
        if data:
            try:
                return _decode_base64_url(data)
            except:
                continue

    return ""


@mcp.tool()
def list_emails(query: str = "", max_results: int = 10) -> list[dict]:
    """
    List emails from Gmail inbox.

    Args:
        query: Gmail search query (e.g., "from:example@gmail.com", "subject:meeting", "is:unread")
        max_results: Maximum number of emails to return (default 10)

    Returns:
        List of email summaries with id, sender, subject, snippet, and date
    """
    service = get_gmail_service()
    results = service.users().messages().list(
        userId="me", q=query, maxResults=max_results
    ).execute()

    messages = results.get("messages", [])
    email_list = []

    for msg in messages:
        msg_detail = service.users().messages().get(
            userId="me", id=msg["id"], format="metadata",
            metadataHeaders=["From", "Subject", "Date"]
        ).execute()

        headers = {h["name"]: h["value"] for h in msg_detail["payload"]["headers"]}
        email_list.append({
            "id": msg["id"],
            "from": headers.get("From", "Unknown"),
            "subject": headers.get("Subject", "No Subject"),
            "date": headers.get("Date", "Unknown"),
            "snippet": msg_detail.get("snippet", "")[:200],
        })

    return email_list


@mcp.tool()
def get_email_body(email_id: str) -> dict:
    """
    Get the full body/content of a specific email.

    Args:
        email_id: The Gmail message ID

    Returns:
        Dictionary with email_id, from, to, subject, date, and body
    """
    service = get_gmail_service()
    message = service.users().messages().get(
        userId="me", id=email_id, format="full"
    ).execute()

    headers = {h["name"]: h["value"] for h in message["payload"]["headers"]}
    body = _extract_plain_text(message)

    return {
        "email_id": email_id,
        "from": headers.get("From", "Unknown"),
        "to": headers.get("To", "Unknown"),
        "subject": headers.get("Subject", "No Subject"),
        "date": headers.get("Date", "Unknown"),
        "body": body,
    }


@mcp.tool()
def create_email_draft(to: str, subject: str, body: str) -> dict:
    """
    Create an email draft (doesn't send it).

    Args:
        to: Recipient email address
        subject: Email subject
        body: Email body text

    Returns:
        Dictionary with draft_id and preview
    """
    global _last_draft_id, _last_draft_message

    service = get_gmail_service()

    # Create MIME message
    message = MIMEText(body)
    message["to"] = to
    message["from"] = "me"
    message["subject"] = subject

    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")

    # Create draft
    draft = service.users().drafts().create(
        userId="me",
        body={"message": {"raw": raw_message}}
    ).execute()

    _last_draft_id = draft["id"]
    _last_draft_message = {
        "to": to,
        "subject": subject,
        "body": body,
    }

    return {
        "draft_id": _last_draft_id,
        "preview": f"To: {to}\nSubject: {subject}\nBody: {body[:200]}...",
    }


@mcp.tool()
def send_last_draft() -> dict:
    """
    Send the last created draft. Must call create_email_draft first.

    Returns:
        Confirmation with sent message details
    """
    global _last_draft_id, _last_draft_message

    if not _last_draft_id:
        return {"error": "No draft exists. Call create_email_draft first."}

    service = get_gmail_service()

    try:
        # Send the draft
        sent_message = service.users().drafts().send(
            userId="me",
            body={"id": _last_draft_id}
        ).execute()

        result = {
            "status": "sent",
            "message_id": sent_message.get("id", "unknown"),
            "details": _last_draft_message,
        }

        # Clear the draft state
        _last_draft_id = None
        _last_draft_message = None

        return result

    except Exception as e:
        return {"error": f"Failed to send draft: {str(e)}"}


@mcp.tool()
def discard_last_draft() -> dict:
    """
    Discard/delete the last created draft without sending.

    Returns:
        Confirmation message
    """
    global _last_draft_id, _last_draft_message

    if not _last_draft_id:
        return {"status": "no_draft_to_discard"}

    service = get_gmail_service()

    try:
        service.users().drafts().delete(userId="me", id=_last_draft_id).execute()
        _last_draft_id = None
        _last_draft_message = None
        return {"status": "discarded"}
    except Exception as e:
        return {"error": f"Failed to discard draft: {str(e)}"}


@mcp.tool()
def delete_email(email_id: str) -> dict:
    """
    Delete/trash an email.

    Args:
        email_id: The Gmail message ID to delete

    Returns:
        Confirmation of deletion
    """
    service = get_gmail_service()

    try:
        service.users().messages().trash(userId="me", id=email_id).execute()
        return {"status": "deleted", "email_id": email_id}
    except Exception as e:
        return {"error": f"Failed to delete email: {str(e)}"}


@mcp.prompt()
def find_job_application_emails(days: int = 60) -> str:
    """
    Prompt template for finding job application emails.

    Args:
        days: Number of days to look back (default 60)

    Returns:
        Search query string for job-related emails
    """
    return f"Search for emails from the last {days} days from job application platforms like Greenhouse, Lever, Workday, or with subjects containing 'application', 'interview', 'hiring', or 'recruiter'."


if __name__ == "__main__":
    # Run with stdio transport for local subprocess usage
    mcp.run(transport="stdio")
