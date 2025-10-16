# 🧠 PromptFlow v0.2

**Cross-runtime AI Flow Orchestrator (TypeScript + Python + Java)**

> Open-source multi-runtime workflow engine for LLM orchestration with parallel execution, RabbitMQ, and Redis context store.

---

## 🚀 Overview

**PromptFlow** is a lightweight, multi-language **AI workflow engine**.  
You can define prompt-based pipelines in YAML, and PromptFlow executes them **across runtimes** —  
TypeScript, Python (FastAPI + OpenAI), and Java (Spring Boot).

Each step can depend on previous outputs via `{{stepId.output}}`,  
and at runtime, all steps are executed in parallel according to their dependency graph (DAG).

---

## 🧱 Tech Stack

| Layer                 | Tech                                  |
| --------------------- | ------------------------------------- |
| **Core Orchestrator** | Node.js 20 + TypeScript               |
| **Queue**             | RabbitMQ (AMQP)                       |
| **State Store**       | Redis                                 |
| **Python Runtime**    | FastAPI + OpenAI SDK                  |
| **Java Runtime**      | Spring Boot 3.4 + Gradle              |
| **Containerization**  | Docker + docker-compose               |
| **Language Interop**  | REST (Python, Java) + Context (Redis) |

---

## ⚙️ Features (v0.2)

✅ YAML-defined prompt workflows  
✅ Multi-runtime execution (TS / Python / Java)  
✅ DAG-based dependency resolver  
✅ Parallel step execution  
✅ RabbitMQ distributed job queue  
✅ Redis-backed shared context  
✅ Scalable worker processes  
✅ TypeScript orchestrator & worker separation

---

## 📦 Example: `examples/flow.yaml`

```yaml
id: crosslang_flow
steps:
  - id: summarize
    runtime: python
    provider: openai:gpt-4o-mini
    prompt: "Summarize this: {{input.text}}"

  - id: translate
    runtime: java
    provider: deepl
    prompt: "Translate to Korean: {{summarize.output}}"

  - id: keywords
    runtime: python
    provider: openai:gpt-4o-mini
    prompt: "Extract 3 keywords: {{translate.output}}"
```

## 🔁 Execution Flow

1. Core parses flow.yaml → builds dependency DAG
2. For each DAG level:
   - Sends Step jobs to RabbitMQ
3. Workers (core-worker) consume and run Steps:
   - Interpolates {{step.output}}
   - Calls runtime (Python or Java)
   - Saves results in Redis
4. Core polls Redis for completion → triggers next level

# 🧾 License

MIT © 2025 PromptFlow Contributors
