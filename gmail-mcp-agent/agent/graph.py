"""
LangGraph agent that uses the Gmail MCP server.
Implements a ReAct-style agent with tools from the MCP server.
"""

import os
from typing import Annotated, Sequence, TypedDict
from functools import lru_cache

from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters


class AgentState(TypedDict):
    """State for the agent graph."""
    messages: Annotated[Sequence, add_messages]


@lru_cache(maxsize=1)
def get_mcp_tools():
    """
    Initialize MCP client and get tools from Gmail server.
    Cached to avoid re-initialization on every run.
    """
    # Path to the MCP server script
    server_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "mcp_server",
        "gmail_server.py"
    )

    async def _get_tools():
        server_params = StdioServerParameters(
            command="python",
            args=[server_path],
        )

        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                # Initialize the session
                await session.initialize()
                # Get available tools
                tools_response = await session.list_tools()
                return session.get_tools()

    # For sync context, we need to run the async code
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_get_tools())


def create_agent_node():
    """Create the agent node that decides which tool to call."""

    @lru_cache(maxsize=1)
    def get_llm_with_tools():
        tools = get_mcp_tools()
        llm = ChatAnthropic(
            model="claude-sonnet-4-20250514",
            temperature=0,
        )
        return llm.bind_tools(tools)

    def agent_node(state: AgentState):
        messages = state["messages"]
        llm = get_llm_with_tools()

        response = llm.invoke(messages)
        return {"messages": [response]}

    return agent_node


def should_continue(state: AgentState) -> str:
    """Determine if we should continue or end based on last message."""
    messages = state["messages"]
    last_message = messages[-1]

    # If there's a tool call, continue to tool node
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"

    # Otherwise, end the conversation
    return END


def create_graph():
    """Build and return the LangGraph agent."""
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("agent", create_agent_node())
    workflow.add_node("tools", ToolNode(get_mcp_tools()))

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


if __name__ == "__main__":
    # Test the graph creation
    graph = create_graph()
    print("Graph created successfully!")
    print("Available tools:", [t.name for t in get_mcp_tools()])
