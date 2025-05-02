from os import getenv
from agents import Agent, Runner, gen_trace_id, trace
from agents.mcp import MCPServerSse
from agents.model_settings import ModelSettings

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

MCP_SSE_SERVER_URL = getenv("MCP_SSE_SERVER_URL", "http://localhost:8000/sse")

async def lifespan(app: FastAPI):
    async with MCPServerSse(
        name="SSE Jarvis Server",
        params={
            "url": MCP_SSE_SERVER_URL,
        },
    ) as server:
        trace_id = gen_trace_id()
        with trace(workflow_name="SSE Jarvis Server", trace_id=trace_id):
            print(f"View trace: https://platform.openai.com/traces/trace?trace_id={trace_id}\n")
        
        app.state.agent = Agent(
            name="Assistant",
            instructions='''Eres un agente inteligente experto en kubernetes y cloud native
            que le permitira al usuario hacer preguntas sobre tecnologias cloud native y
            usar las herramientas disponibles para operar un cluster de kubernetes.
            ''',
            mcp_servers=[server],
            model="gpt-4o-mini",
            model_settings=ModelSettings(
                tool_choice="required",
                max_tokens=300,
                temperature=0.5,
            ),
        )
        print("Agent initialized.")
        yield
    print("Lifespan cleanup complete.")


app = FastAPI(lifespan=lifespan)

class Request(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(request: Request):
    try:
        agent = app.state.agent
        print(agent)
        print(request.question)
        answer = await Runner.run(starting_agent=agent, input=request.question)
        return {"answer": answer.final_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# async def run(mcp_server: MCPServer):
    

#     # Use the `add` tool to add two numbers
#     message = "Add these numbers: 7 and 22."
#     print(f"Running: {message}")
#     result = await Runner.run(starting_agent=agent, input=message)
#     print(result.final_output)

#     # Use the `add` tool to add two numbers
#     message = "Cuales son los deployments en el namespace kube system."
#     print(f"Running: {message}")
#     result = await Runner.run(starting_agent=agent, input=message)
#     print(result.final_output)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
