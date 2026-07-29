"""
FastAPI backend for the Gmail MCP Agent web app.
Provides login, chat endpoints, and serves the frontend.
"""

import os
import asyncio
from typing import Optional

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

from backend.auth import verify_password, create_session_token, verify_session_token

# Load environment variables
load_dotenv()

# Check for required env vars
if not os.getenv("ANTHROPIC_API_KEY"):
    print("Warning: ANTHROPIC_API_KEY not found in .env file")
if not os.getenv("APP_PASSWORD_HASH"):
    print("Warning: APP_PASSWORD_HASH not found. Run 'python backend/setup_auth.py' first.")
if not os.getenv("SESSION_SECRET"):
    print("Warning: SESSION_SECRET not found. Run 'python backend/setup_auth.py' first.")


app = FastAPI(title="Gmail MCP Agent")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global agent state
_agent_graph = None
_mcp_session = None
_mcp_tools = None


class LoginRequest(BaseModel):
    password: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: list = []


async def get_current_user(request: Request) -> Optional[str]:
    """Get current user from session cookie."""
    token = request.cookies.get("session")
    if not token:
        return None
    return verify_session_token(token)


async def initialize_agent():
    """Initialize the MCP agent once at startup."""
    global _agent_graph, _mcp_session, _mcp_tools

    if _agent_graph is not None:
        return

    print("Initializing Gmail MCP Agent...")

    # Path to the MCP server script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(script_dir)
    server_path = os.path.join(parent_dir, "mcp_server", "gmail_server.py")

    server_params = StdioServerParameters(
        command="python",
        args=[server_path],
    )

    read, write = await stdio_client(server_params).__aenter__()
    session = await ClientSession(read, write).__aenter__()

    # Initialize the session
    await session.initialize()

    # Get available tools
    tools = await session.get_tools()

    print(f"Connected to Gmail MCP Server!")
    print(f"Available tools: {[t.name for t in tools]}")

    # Create the agent graph
    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        temperature=0,
        max_tokens=2048,
    )
    llm_with_tools = llm.bind_tools(tools)

    from typing import Annotated, Sequence, TypedDict

    class AgentState(TypedDict):
        messages: Annotated[Sequence, add_messages]

    def agent_node(state: AgentState):
        messages = state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    def should_continue(state: AgentState) -> str:
        messages = state["messages"]
        last_message = messages[-1]

        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"

        return END

    workflow = StateGraph(AgentState)
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", ToolNode(tools))
    workflow.add_edge(START, "agent")
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {"tools": "tools", END: END},
    )
    workflow.add_edge("tools", "agent")

    _agent_graph = workflow.compile()
    _mcp_session = (session, read, write)
    _mcp_tools = tools

    print("Agent initialized and ready!")


@app.on_event("startup")
async def startup_event():
    """Initialize agent on startup."""
    await initialize_agent()


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    global _mcp_session
    if _mcp_session:
        session, read, write = _mcp_session
        try:
            await session.__aexit__(None, None, None)
        except Exception:
            pass


@app.post("/api/login")
async def login(request: LoginRequest):
    """Authenticate user and set session cookie."""
    stored_hash = os.getenv("APP_PASSWORD_HASH")

    if not stored_hash:
        raise HTTPException(status_code=500, detail="Authentication not configured")

    if not verify_password(request.password, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid password")

    # Create session token
    token = create_session_token("admin")

    response = JSONResponse({"success": True})
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=int(os.getenv("SESSION_MAX_AGE_MINUTES", "720")) * 60,
    )

    return response


@app.post("/api/logout")
async def logout():
    """Logout user by clearing session cookie."""
    response = JSONResponse({"success": True})
    response.delete_cookie(key="session")
    return response


@app.get("/api/me")
async def get_me(current_user: str = Depends(get_current_user)):
    """Get current user info."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"user_id": current_user}


@app.post("/api/chat")
async def chat(request: ChatRequest, current_user: str = Depends(get_current_user)):
    """Process a chat message with the agent."""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if _agent_graph is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")

    from langchain_core.messages import HumanMessage, AIMessage

    # Build messages from conversation history
    messages = []
    for msg in request.conversation_history:
        if msg.get("role") == "human":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg.get("role") == "ai":
            messages.append(AIMessage(content=msg["content"]))

    # Add current message
    messages.append(HumanMessage(content=request.message))

    try:
        # Run the agent
        result = await asyncio.get_event_loop().run_in_executor(
            None, lambda: _agent_graph.invoke({"messages": messages})
        )

        # Get the assistant's response
        response_messages = result["messages"]
        assistant_response = None

        for msg in reversed(response_messages):
            if hasattr(msg, "content") and msg.content:
                assistant_response = msg.content
                break

        if not assistant_response:
            assistant_response = "I processed your request but have no specific response."

        return {
            "response": assistant_response,
            "conversation_history": [
                {"role": "human", "content": request.message},
                {"role": "ai", "content": assistant_response},
            ],
        }

    except Exception as e:
        print(f"Error processing chat: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


# Serve frontend static files
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serve the main HTML page."""
    index_path = os.path.join(frontend_dir, "index.html")
    if not os.path.exists(index_path):
        raise HTTPException(status_code=404, detail="Frontend not found")

    with open(index_path, "r") as f:
        return HTMLResponse(content=f.read())


app.mount("/static", StaticFiles(directory=frontend_dir), name="static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
