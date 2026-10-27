# Gmail MCP Agent

A minimal, from-scratch project: a custom MCP server that exposes your Gmail inbox as tools, connected to a LangGraph ReAct agent as the MCP client. Ask it: "list emails I've received from job applications" and it will search, inspect, and summarize them.

## Features

- 🔍 **Search Emails** - Find emails using Gmail search queries
- 📖 **Read & Summarize** - Get full email content and AI-powered summaries
- ✉️ **Draft & Send** - Create drafts and send emails with confirmation
- 🗑️ **Delete Spam** - Remove unwanted emails
- 💬 **Web UI** - Clean, modern chat interface with authentication
- 🔐 **Secure Auth** - Password-protected access with session cookies

## Folder Structure

```
gmail-mcp-agent/
├── requirements.txt
├── .env.example          -> copy to .env
├── credentials/          -> your Google OAuth files go here (gitignored)
├── mcp_server/
│   └── gmail_server.py   -> the MCP SERVER (exposes Gmail as tools)
├── agent/
│   ├── graph.py          -> the MCP CLIENT + LangGraph agent
│   └── main.py           -> run this for CLI
└── backend/
    ├── auth.py           -> password hashing + session cookies
    ├── setup_auth.py     -> ONE-TIME script: sets your password
    └── server.py         -> FastAPI app serving web UI
└── frontend/
    ├── index.html
    ├── styles.css
    └── app.js
```

## Google Cloud Console Setup (One-Time, ~5 minutes)

This is the part most people get stuck on, so follow it exactly:

1. **Go to https://console.cloud.google.com/** and create a new project (or pick an existing one)

2. **Enable Gmail API:**
   - Left sidebar: APIs & Services → Library
   - Search "Gmail API" → click Enable

3. **Configure OAuth Consent Screen:**
   - APIs & Services → OAuth consent screen
   - User type: External (unless you have Google Workspace)
   - Fill in app name (e.g., "Personal Gmail MCP Agent")
   - Add your email as support/dev contact
   - Scopes: skip adding here — the code requests scope directly
   - Test users: add your own Gmail address
   - Click Save and Continue

4. **Create OAuth Credentials:**
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Application type: Desktop app
   - Name: anything (e.g., "gmail-mcp-server")
   - Click Create → Download JSON
   - Rename to `credentials.json` and place at:
     ```
     gmail-mcp-agent/credentials/credentials.json
     ```

That file is your app's OAuth client identity — it's what lets your script kick off the "Allow access?" consent screen. Keep it out of git.

## Installation

```bash
cd gmail-mcp-agent
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
```

## Configuration

Copy the env example and add your Anthropic API key:

```bash
copy .env.example .env  # Windows
# or: cp .env.example .env  # Mac/Linux
```

Edit `.env` and set:
```
ANTHROPIC_API_KEY=sk-ant-...
```

## First Run (OAuth Dance)

### CLI Mode

```bash
python agent\main.py
```

What happens:
1. The LangGraph agent starts
2. The MCP client launches `gmail_server.py` as a subprocess
3. Since no `token.json` exists yet, your browser opens to Google's consent screen
4. Log in and click Allow
5. The server caches a refresh token to `credentials/token.json`
6. Future runs are silent (no browser needed)

You should see:
```
=== AGENT RESPONSE ===

Here are the job application emails I found from the last 60 days:

1. Greenhouse (no-reply@greenhouse.io) — "Your application to Acme Corp was received" — Jun 14, 2026
2. Lever (careers@lever.co) — "Thank you for applying to Senior AI Engineer" — Jun 20, 2026
...
```

### Web App Mode

#### One-Time Auth Setup

```bash
python backend\setup_auth.py
```

This prompts for a password (never stored raw — only its bcrypt hash goes into `.env`) and writes a random `SESSION_SECRET` into `.env`.

#### Run the Web App

```bash
uvicorn backend.server:app --reload --port 8000
```

Open http://127.0.0.1:8000 in your browser. Enter your password and start chatting!

## Available Tools

The MCP server exposes these tools to the agent:

| Tool | Description |
|------|-------------|
| `list_emails` | List emails with optional Gmail search query |
| `get_email_body` | Get full content of a specific email |
| `create_email_draft` | Create an email draft (doesn't send) |
| `send_last_draft` | Send the last created draft |
| `discard_last_draft` | Delete a draft without sending |
| `delete_email` | Trash/delete an email |

## Example Queries

Try asking the agent:

- "List my recent emails"
- "Show me emails from job applications in the last 60 days"
- "Summarize the latest email from my boss"
- "Delete all spam emails"
- "Draft a reply to the last email thanking them for their time"
- "Send an email to john@example.com about our meeting tomorrow"

## Sending Emails (Draft-then-Confirm)

The agent never sends emails in one shot. It always:
1. Creates a Gmail draft first
2. Shows it to you in chat
3. Only sends after you reply with "yes, send it"

**Example flow:**

```
You: Send an email to priya@example.com about following up on my interview

Agent: Here's the draft I've prepared:
       To: priya@example.com
       Subject: Following Up on Our Interview
       Body: Hi Priya, ...
       
       Want me to send this, or should I change anything?

You: looks good, send it

Agent: Sent! Message ID: ...
```

If you say "actually don't send that", the agent calls `discard_last_draft` and nothing is sent.

## Re-authorizing for Send Access

Sending requires broader OAuth scope (`gmail.compose`). If your cached token was issued for readonly access:

```bash
del credentials\token.json  # Windows
# or: rm credentials/token.json  # Mac/Linux
```

Next run, the browser will open for fresh consent including send permissions.

## Understanding the Architecture

| Concept | Where it shows up |
|---------|-------------------|
| **MCP Server** | `mcp_server/gmail_server.py` — independent process exposing tools |
| **MCP Client** | `MultiServerMCPClient` inside `graph.py` — manages 1:1 session |
| **Host** | Your LangGraph agent process (`main.py`) — owns the LLM loop |
| **Tools** | `list_emails`, `get_email_body`, etc. — decorated with `@mcp.tool()` |
| **Transport** | stdio — subprocess + stdin/stdout for local communication |
| **OAuth 2.0** | `get_gmail_service()` — one-time browser consent, cached refresh token |
| **ReAct Agent** | `create_react_agent()` in `graph.py` — reason→act→observe loop |

## Debugging

### Test the MCP Server Alone

Use the official MCP Inspector to test the server without LangGraph:

```bash
npx @modelcontextprotocol/inspector python mcp_server\gmail_server.py
```

This opens a browser UI where you can manually call tools and see raw JSON-RPC traffic.

### Common Issues

**"credentials.json not found"**
- Make sure you downloaded the OAuth JSON from Google Cloud Console
- Place it at `gmail-mcp-agent/credentials/credentials.json`

**"ANTHROPIC_API_KEY not found"**
- Copy `.env.example` to `.env`
- Add your actual API key

**Browser doesn't open for OAuth**
- Check that port 8080+ isn't blocked by firewall
- Try running with admin privileges

## Security Notes

- **Single shared password** — not multi-account (perfect for personal use)
- **Password never stored raw** — only bcrypt hash in `.env`
- **Session cookies** — signed, expiring (default 12 hours)
- **Credentials isolated** — `credentials.json` is OAuth client identity, `token.json` is your refresh token

To change password later: re-run `python backend\setup_auth.py` (invalidates existing sessions).

## Next Steps

- **Add more scopes/tools** — e.g., `gmail.modify` to label emails
- **Switch to HTTP transport** — expose server to remote clients
- **Deploy to cloud** — run on ECS Fargate or similar
- **Add search_and_summarize tool** — chain operations server-side

## License

MIT
