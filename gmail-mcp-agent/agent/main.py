"""
Main entry point for the CLI agent.
Runs the LangGraph agent with Gmail MCP tools.
"""

import os
from dotenv import load_dotenv

from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters
from typing import Annotated, Sequence, TypedDict
import asyncio


# Load environment variables
load_dotenv()

# Check for API key
if not os.getenv("ANTHROPIC_API_KEY"):
    print("Error: ANTHROPIC_API_KEY not found in .env file")
    print("Please copy .env.example to .env and set your Anthropic API key")
    exit(1)


class AgentState(TypedDict):
    """State for the agent graph."""
    messages: Annotated[Sequence, add_messages]


async def get_mcp_tools():
    """Initialize MCP client and get tools from Gmail server."""
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

    return tools, session, read, write


def create_agent_graph(tools):
    """Build and return the LangGraph agent."""
    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        temperature=0,
        max_tokens=2048,
    )
    llm_with_tools = llm.bind_tools(tools)

    def agent_node(state: AgentState):
        messages = state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    def should_continue(state: AgentState) -> str:
        messages = state["messages"]
        last_message = messages[-1]

        # If there's a tool call, continue to tool node
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"

        # Otherwise, end the conversation
        return END

    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", ToolNode(tools))

    # Set entry point
    workflow.add_edge(START, "agent")

    # Conditional edges based on whether tools are called
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            END: END,
        }
    )

    # After tools, go back to agent
    workflow.add_edge("tools", "agent")

    return workflow.compile()


async def run_cli():
    """Run the CLI agent loop."""
    print("Initializing Gmail MCP Agent...")
    print("This may open a browser for OAuth authorization on first run.\n")

    # Get tools from MCP server
    tools, session, read, write = await get_mcp_tools()

    print(f"Connected to Gmail MCP Server!")
    print(f"Available tools: {[t.name for t in tools]}\n")

    # Create the agent graph
    graph = create_agent_graph(tools)

    print("=" * 60)
    print("Gmail Agent Ready!")
    print("=" * 60)
    print("\nExample queries:")
    print("  - 'List my recent emails'")
    print("  - 'Show me emails from job applications'")
    print("  - 'Summarize the latest email from my boss'")
    print("  - 'Delete spam emails'")
    print("  - 'Draft a reply to the last email'")
    print("\nType 'quit' or 'exit' to stop\n")

    # Chat loop
    messages = []

    while True:
        try:
            user_input = input("You: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ["quit", "exit"]:
                print("\nGoodbye!")
                break

            # Add user message
            from langchain_core.messages import HumanMessage
            messages.append(HumanMessage(content=user_input))

            # Run the agent
            result = await graph.ainvoke({"messages": messages})

            # Get the assistant's response
            response_messages = result["messages"]
            assistant_response = None

            for msg in reversed(response_messages):
                if hasattr(msg, "content") and msg.content:
                    assistant_response = msg.content
                    break

            if assistant_response:
                print(f"\nAgent: {assistant_response}\n")

            # Update messages for next turn
            messages = response_messages

        except KeyboardInterrupt:
            print("\n\nInterrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\nError: {e}\n")
            # Reset messages on error
            messages = []

    # Cleanup
    await session.__aexit__(None, None, None)


if __name__ == "__main__":
    asyncio.run(run_cli())
