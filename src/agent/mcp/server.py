from src.agent.mcp import main_mcp, setup
import asyncio

if __name__ == "__main__":
    asyncio.run(setup())

    main_mcp.run(transport="sse")
