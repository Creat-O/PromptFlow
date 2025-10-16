import os
import time

from fastapi import FastAPI
from openai import OpenAI
from pydantic import BaseModel

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class Step(BaseModel):
    id: str
    prompt: str
    provider: str | None = None
    context: dict


@app.get("/health")
async def health():
    return {"ok": True}


@app.post("/execute")
async def execute(step: Step):
    t0 = time.time()
    # 실제 LLM 호출
    res = client.chat.completions.create(
        model="gpt-4o-mini", messages=[{"role": "user", "content": step.prompt}]
    )
    output = res.choices[0].message.content
    return {
        "id": step.id,
        "output": output,
        "latency": round((time.time() - t0) * 1000, 2),
    }
