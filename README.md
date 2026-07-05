# FinAgent — AI-Powered Personal Finance Assistant

A full-stack, multi-user personal finance assistant built on the MERN stack, powered by an LLM agent that reasons over your financial data using a ReAct (Reason → Act → Observe) loop, tool/function calling, and Retrieval-Augmented Generation (RAG) for grounded budgeting advice.

**Live demo:** https://fin-agent-chi.vercel.app
**Backend API:** https://finagent-oicu.onrender.com/api/health

> Note: the backend runs on Render's free tier, which spins down after 15 minutes of inactivity. The first request after idle time may take 30-50 seconds to respond while the server wakes up.

---

## What it does

Type natural-language requests like:

- *"I spent 450 on groceries yesterday"* → logs a real expense
- *"what's my balance?"* → queries real aggregated data, never a guess
- *"any tips for saving on groceries?"* → retrieves grounded advice from a curated knowledge base via RAG
- *"add 300 for fuel and tell me my balance"* → chains multiple tool calls in a single ReAct turn

All responses are backed by real tool calls against MongoDB — the LLM never invents financial numbers; every amount shown comes directly from a database query.

---

## Key features

- **JWT authentication** with per-user data isolation enforced at the query level, not just hidden in the UI
- **LLM tool/function calling** — `addExpense`, `addIncome`, `getBalance`, `getSummary`, `searchFinancialTips`
- **ReAct reasoning loop** — the agent can chain multiple tool calls per turn (not single-shot function calling), with the full reasoning trace visible in the chat UI and server logs
- **Conversation memory** persisted per user in MongoDB, with a bounded context window sent to the LLM
- **RAG-grounded financial tips** — 20 curated chunks, embedded locally (no external API, no cost) using `@xenova/transformers`, retrieved via cosine similarity search
- **Analytics dashboard** — category breakdown (pie), 6-month income/expense trend (line), and budget-vs-actual (bar), all driven by live MongoDB aggregation pipelines
- **Numeric grounding safeguards** — the agent is explicitly constrained to quote tool results verbatim rather than performing its own arithmetic on financial figures
- **Resilience** — automatic retry with a corrective prompt if the LLM returns a malformed tool call
- **Eval harness** — 30 hand-written test queries scoring tool-call selection accuracy
- **Token/cost tracking** per conversation
- **Dockerized** — `docker-compose up` runs backend, frontend, and MongoDB as one stack
- **CI pipeline** — GitHub Actions runs on every push (dependency install, syntax/build checks) for both backend and frontend

---

## Tech stack

**Frontend:** React (Vite), Tailwind CSS v4, React Router, Axios, Recharts
**Backend:** Node.js, Express, MongoDB + Mongoose, JWT + bcrypt
**AI/Agent layer:** Groq SDK (`llama-3.3-70b-versatile`), custom ReAct loop, local embeddings (`@xenova/transformers`)
**DevOps:** Docker + docker-compose, GitHub Actions CI/CD
**Deployment:** Vercel (frontend), Render (backend), MongoDB Atlas (database)

---

## Architecture

```
finagent/
  backend/
    config/       → MongoDB connection
    models/       → User, Transaction, Conversation, KnowledgeChunk, Budget
    middleware/   → JWT auth, centralized error handling
    routes/       → Express routers (auth, chat, budgets, analytics)
    controllers/  → thin request handlers
    services/     → Groq client, ReAct agent loop, RAG/embeddings, tool implementations
    eval/         → eval harness + fixed test query set
    utils/        → JWT token generation
  frontend/
    src/
      api/          → Axios instance with JWT interceptor
      context/      → Auth context (login/register/logout state)
      pages/        → Login, Register, Chat, Dashboard
      components/   → PrivateRoute, charts (pie/line/bar)
```

**Design pattern:** MVC + service layer — controllers stay thin, business logic (the agent loop, RAG, aggregations) lives in the service layer. Every database query is scoped to `req.user._id` from the verified JWT, never trusting client-supplied identifiers.

**Why local embeddings instead of an external embeddings API:** avoids extra API keys, cost, and rate limits, while still demonstrating a real embedding + cosine-similarity retrieval pipeline that's structured to swap in MongoDB Atlas `$vectorSearch` later without changing the calling code.

---

## Running locally

### Prerequisites
- Node.js 20+
- MongoDB (local install or Atlas connection string)
- A free Groq API key ([console.groq.com](https://console.groq.com))

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET, GROQ_API_KEY
npm run seed:knowledge # one-time: seeds the RAG knowledge base with embeddings
npm run dev
```

Backend runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Running the eval harness

```bash
cd backend
npm run eval
```

Runs 30 fixed test queries against the live agent and prints a tool-call accuracy percentage.

### Running with Docker

```bash
docker-compose up --build
```

Starts backend (`:5000`), frontend (`:4173`), and MongoDB as one stack.

---

## Environment variables

**`backend/.env`**
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/finagent
JWT_SECRET=your_random_secret
JWT_EXPIRE=30d
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000/api
```

---

## System design notes

- **Function/tool calling:** the LLM never touches the database directly — it returns structured JSON describing an intended tool call; the backend validates and executes it. Malformed tool-call JSON is caught and retried once with a corrective prompt before failing gracefully.
- **ReAct vs. single-shot function calling:** a `while` loop lets the agent call a tool, observe the result, and decide whether it needs another tool before answering — enabling compound questions ("what's my balance and any saving tips?") at the cost of extra LLM round-trips.
- **RAG:** the knowledge base is embedded once via a local model; a query's embedding is compared against every stored chunk using cosine similarity, and only the top-k most relevant chunks are injected into the prompt — cheaper and more accurate than stuffing the full knowledge base into every request.
- **Numeric hallucination guardrail:** the system prompt explicitly forbids the model from performing its own arithmetic on financial figures — every number in a response must trace back to a tool's returned value.
- **Per-user isolation:** every Mongoose query filters by the authenticated user's ID from the verified JWT payload, never a client-supplied value.
