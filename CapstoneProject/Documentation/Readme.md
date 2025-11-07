# **Experiment 10 – Capstone Project: AI-Powered Chatbot (Beli)**

**Authors:** Gurkirat Singh – 23BAI70476 · Riya Kashyap – 23BAD10002

---

## Overview

**Beli** (ਬੇਲੀ = “friend” in Punjabi) is a student-friendly MERN chatbot. It exposes a **provider-agnostic Node/Express API** that can talk to **Gemini 2.5 Flash** (via Gemini API) or a **Mock provider** for tests. It supports **streamed responses (SSE)**, **per-session memory with auto-summaries**, **JWT auth**, **rate limits & guardrails**, and a **React (Vite) UI** with history, rename, export, model switcher, and a Settings modal for temperature & system prompt.

This project showcases modern full-stack patterns: streaming UX, provider abstraction, secure secrets, persistence with MongoDB, and pragmatic observability.

---

## Learning Objectives

* Design a **provider abstraction** for LLM backends (Gemini/Mock, easily extensible to OpenAI/Dialogflow).
* Implement **real-time token streaming** with **Server-Sent Events (SSE)** and client-side incremental rendering.
* Manage **session context & memory** with token budgets and **automatic summarization**.
* Build a **secure Express API** with JWT auth, CORS, CSRF considerations, rate limiting, and input validation.
* Persist **users/sessions/messages/prompts** in MongoDB with **TTL** cleanup for inactive sessions.
* Create a **React + Tailwind + shadcn/ui** chat interface with history, rename, export, and model picker.
* Add **observability** (structured logs, simple metrics) and **cost awareness** (token counts/budgets).
* Write **unit/contract/E2E tests** using a deterministic **Mock provider** and non-stream fallback.

---

## Project Structure

```
capstone-beli/
├── apps/
│   ├── api/                      # Express + TypeScript server
│   │   ├── src/
│   │   │   ├── index.ts          # app bootstrap
│   │   │   ├── server.ts         # express wiring, CORS/Helmet
│   │   │   ├── config.ts         # env & provider registry
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts       # JWT (httpOnly cookie)
│   │   │   │   ├── cors.ts       # CORS + preflight
│   │   │   │   ├── errors.ts     # error mapper
│   │   │   │   └── rateLimit.ts  # per-user sliding window
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts       # register/login/me
│   │   │   │   ├── sessions.ts   # CRUD + rename + settings
│   │   │   │   ├── messages.ts   # GET messages (id or query)
│   │   │   │   ├── chat.ts       # /chat (non-stream) + /chat/stream (SSE)
│   │   │   │   └── config.ts     # GET /api/config (providers/models)
│   │   │   ├── providers/
│   │   │   │   ├── base.ts       # BaseProvider interface
│   │   │   │   ├── gemini.ts     # Gemini 2.5 Flash adapter
│   │   │   │   └── mock.ts       # deterministic mock
│   │   │   ├── services/
│   │   │   │   ├── summarize.ts  # auto-summary for long sessions
│   │   │   │   └── usage.ts      # token accounting/budgets
│   │   │   ├── db/
│   │   │   │   ├── mongo.ts
│   │   │   │   └── models/{User.ts,Session.ts,Message.ts,Prompt.ts}
│   │   │   └── utils/{sse.ts,logger.ts,ids.ts}
│   │   ├── jest.config.ts
│   │   └── Dockerfile
│   └── web/                      # React + Vite + TypeScript
│       ├── src/
│       │   ├── app.tsx           # layout + top bar model picker
│       │   ├── main.tsx
│       │   ├── lib/{api.ts,store.ts,brand.ts}
│       │   ├── components/
│       │   │   ├── chat/{ChatWindow.tsx,MessageList.tsx,Composer.tsx}
│       │   │   ├── sidebar/HistorySidebar.tsx  # sessions + rename
│       │   │   └── settings/SettingsDialog.tsx # temperature + system prompt
│       │   ├── pages/{Login.tsx,Chat.tsx}
│       │   └── styles/tailwind.css
│       ├── vite.config.ts
│       └── Dockerfile
├── docker/docker-compose.yml      # api + mongo (+ mongo-express)
├── .env.example
└── README.md
```

---

## Technologies Used

* **Backend**

  * Node.js, Express.js, TypeScript, **SSE**
  * MongoDB + Mongoose (TTL indexes)
  * Zod (validation), Helmet, CORS, cookie-parser
  * JWT (httpOnly cookies), simple **rate limiting**
  * pino (structured logs)
* **LLM Providers**

  * **Gemini 2.5 Flash** via Google AI SDK (configurable)
  * **Mock provider** (deterministic, for tests/offline)
* **Frontend**

  * React (Vite, TypeScript), **React Query**, **Zustand**
  * Tailwind CSS, **shadcn/ui**, lucide-react icons
  * Incremental streamed rendering; tooltips, toasts
* **Dev & Tests**

  * pnpm, Docker Compose
  * Jest/Supertest (API), Vitest/Playwright (optional E2E)

---

## Prerequisites

* Node.js **>= 18**
* pnpm **>= 8**
* Docker (for Mongo) or local MongoDB **6+**
* (Optional) **GEMINI_API_KEY** for Gemini; otherwise use Mock

---

## Installation & Setup

1. **Clone & install**

```bash
git clone <your-repo-url> capstone-beli
cd capstone-beli
pnpm install
```

2. **Environment**
   Create `.env` at repo root (or `apps/api/.env`):

```env
# Server
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=dev_secret
COOKIE_SECURE=false

# Mongo
MONGO_URI=mongodb://localhost:27017/mern_chat

# Provider defaults
PROVIDER_DEFAULT=mock

# Gemini (optional, to enable real model)
GEMINI_API_KEY=your_gemini_api_key
```

Frontend dev URL:

```
apps/web/.env.local
VITE_API_URL=http://localhost:4000
```

3. **Start Mongo (Docker)**

```bash
cd docker
docker compose up -d
```

---

## Running the Application

### Method 1 – Dev mode (recommended)

```bash
# from project root
pnpm -r dev
# API on http://localhost:4000, Web on http://localhost:5173
```

### Method 2 – With Docker Compose

```bash
docker compose -f docker/docker-compose.yml up --build
```

### Optional Scripts

```bash
pnpm -r test       # run backend tests (Jest)
pnpm -r lint       # eslint
pnpm -r build      # prod build for both apps
```

---

## Features

### 1) Provider Abstraction

* Unified interface for `chat({ messages, model, temperature, tools?, stream? })`
* Plug-in adapters: **gemini.ts**, **mock.ts**
* Config surfaced via `GET /api/config` (providers, models, enabled flags)

### 2) Streaming (SSE) & Non-Stream Fallback

* `POST /api/chat/stream` → emits JSON lines `{type, data}` with heartbeats
* `POST /api/chat` → single response (used in tests/fallback)

### 3) Context & Memory

* Rolling history capped by token budget
* **Auto-summarize** older turns into a concise system note
* Per-session **temperature** & **system prompt**

### 4) React Chat UI (Professional & Minimal)

* Auto-creates a **New Chat** on first load
* Left: sessions with **rename**
* Top-bar: **Model** selector (Mock / Gemini 2.5 Flash)
* Main: messages + icon actions (**clear**, **summarize**, **export**)
* **Settings** modal: **temperature** slider & **system prompt**
* Disabled states + tooltips (no noisy empty-state text)

### 5) Safety & Guardrails

* Zod validation, profanity/self-harm check (basic)
* Prompt-injection heuristics (strip obvious overrides)
* Per-user rate limits, provider timeouts
* Secrets only via env vars; never logged

### 6) Persistence & Export

* Mongo collections: Users, Sessions (TTL), Messages, Prompts
* Export conversation as JSON (per session)

### 7) Observability & Cost

* p50/p95 latency, token counts, error rates via `GET /api/metrics`
* Correlation IDs per request

---

## API & Streaming Endpoints

### Auth

* `POST /api/auth/register` → `{ user }`
* `POST /api/auth/login`    → sets httpOnly cookie
* `GET  /api/auth/me`       → `{ user }`

### Sessions & Messages

* `GET  /api/sessions`              → list (sorted desc)
* `POST /api/sessions`              → create new `{ session }`
* `GET  /api/sessions/:id`          → get one
* `PATCH /api/sessions/:id`         → `{ title?, provider?, model?, temperature?, systemPrompt? }`
* `GET  /api/messages?sessionId=ID` → `{ messages: [...] }`

  * Alias: `GET /api/sessions/:id/messages`

### Chat

* `POST /api/chat`

  ```json
  { "sessionId":"...", "messages":[{"role":"user","content":"Hi Beli!"}] }
  ```
* `POST /api/chat/stream` (SSE)
  Emits:

  ```
  event: message
  data: {"type":"text","delta":"Hello..."}
  ```

### Config & Metrics

* `GET /api/config`  → providers/models + enabled flags
* `GET /api/metrics` → simple JSON stats

---

## Key Types (excerpt)

```ts
// apps/api/src/providers/base.ts
export type ChatMessage = { role: 'system'|'user'|'assistant'; content: string };

export type ChatRequest = {
  sessionId: string;
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  stream?: boolean;
};

export type StreamChunk =
  | { type:'text'; delta:string }
  | { type:'event'; name:'start'|'end'|'error'|'heartbeat'; data?:any };

export interface BaseProvider {
  id(): 'mock'|'gemini';
  chat(req: ChatRequest, onStream?: (c: StreamChunk)=>void): Promise<{message:{role:'assistant';content:string}, usage?:any}>;
}
```

---

## Prerecorded Flows (How to Use)

1. **Sign up / Sign in** → redirected to Chat
2. **Auto New Chat** appears (selected)
3. **Pick Model** (top bar):

   * **Mock Model** → works offline
   * **Gemini 2.5 Flash** → requires `GEMINI_API_KEY`
4. **(Optional) Open Settings** → set **temperature** and **system prompt**
5. **Type & Send** → streamed or non-streamed reply
6. **Rename** session (sidebar)… **Export** / **Clear** with icon buttons

---

## Testing the Application

### Quick Smoke (API)

```bash
# register + login + create session + send + get messages
pnpm --filter @apps/api test
```

### Manual UI

* Start both (`pnpm -r dev`)
* Open `http://localhost:5173`
* Create a message on Mock; switch to Gemini (if key set) and send again
* Try rename, clear, summarize, export

---

## Troubleshooting

* **“Error loading session/messages”**

  * Ensure FE uses `VITE_API_URL=http://localhost:4000`
  * Check you’re logged in (`/api/auth/me`)
  * `POST /api/sessions` must return `{ session: { _id: ... } }`

* **Model dropdown disabled**

  * `GET /api/config` → `gemini.enabled` must be `true`
  * Set `GEMINI_API_KEY` and restart API

* **Cookies not set**

  * In dev: `COOKIE_SECURE=false`, `sameSite:'lax'`, CORS origin `http://localhost:5173`, `credentials:true`

* **Streaming hangs**

  * Verify SSE headers & heartbeat; fall back to `/api/chat` (non-stream)

---

## Performance Considerations

* Token windowing + summarization prevents runaway prompt sizes
* SSE with backpressure safe-guards; disconnect stops generation
* TTL prunes inactive sessions to keep DB lean

---

## Security Considerations

* httpOnly cookies, CSRF double-submit (if enabled)
* Input validation with Zod everywhere
* Redaction of secrets; strict CORS allowlist
* Simple per-user rate limits

---

## Future Enhancements

* Add **OpenAI** & **Dialogflow** adapters behind env flags
* Tool calling (FAQ/DB lookup) with schema-checked args
* Prometheus/OpenTelemetry exporter
* File uploads and RAG (notes → vector store)
* Team workspaces & budget caps

---

## Dependencies

### Backend (excerpt)

```json
{
  "express": "^4.x",
  "typescript": "^5.x",
  "zod": "^3.x",
  "mongoose": "^8.x",
  "cookie-parser": "^1.x",
  "helmet": "^7.x",
  "cors": "^2.x",
  "pino": "^9.x",
  "jsonwebtoken": "^9.x",
  "jest": "^29.x",
  "supertest": "^7.x"
}
```

### Frontend (excerpt)

```json
{
  "react": "^18.x",
  "vite": "^5.x",
  "typescript": "^5.x",
  "react-query": "^5.x",
  "zustand": "^4.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x",
  "shadcn-ui": "latest",
  "vitest": "^2.x"
}
```

---

## Browser Compatibility

* Chrome/Edge/Firefox/Safari (modern evergreen browsers)

---

## Authors

**Gurkirat Singh (23BAI70476)**
**Riya Kashyap (23BAD10002)**

---

## License

MIT (for coursework use)

---

*This experiment is part of Full Stack Development Coursework, Semester 5.*
