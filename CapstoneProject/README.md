# 📘 **Documentation**

All project documentation — including the **Project Report**, **Project PPT**, and **Source Code** — is available in the `Documentation/` folder of this repository.

---

# ✨ **Beli – MERN AI Chatbot**

### **Capstone Project – Full Stack Development**  
**Authors:** Gurkirat Singh (23BAI70476) & Riya Kashyap (23BAD10002)

---

## 🧠 About **Beli**

**Beli (ਬੇਲੀ)** means **“a close friend / companion” in Punjabi (Gurmukhi)**.  
The chatbot is designed as a **student-friendly AI study companion** — someone who feels approachable like a friend yet intelligent enough to help with academics, planning, summaries, and conversation.

The goal of *Beli* is to provide university students with an AI assistant they can **study with, learn from, and talk to** — combining **cultural identity**, **modern AI**, and a **minimal, premium user experience**.

---

## 🚀 Overview

A full-stack **MERN AI Chatbot** application with provider-agnostic backend, real-time streaming, session context management, and built-in safety features.

---

## 🧩 Features

- 🤖 **Provider-Agnostic Backend** with support for:
  - **Gemini (default)**
  - OpenAI
  - Dialogflow ES
  - Mock Provider (for development/testing)

- 🔥 **SSE Streaming** for real-time AI responses  
- 🧵 **Session-Based Chat** with memory, token budgeting & auto-summarization  
- 🛡️ **Security & Guardrails**
  - JWT Authentication
  - Rate Limiting
  - Input Validation & Safety Filters  
- 🎨 **Modern UI & UX**
  - React + TypeScript + Tailwind  
  - Zustand global state
  - Student-centric clean UI  
- 🐳 **Docker Support** for one-click deployment  

---

## 🧱 Tech Stack

### 🎭 Frontend
- React 18 + Vite  
- TypeScript  
- Tailwind CSS  
- Zustand (State Management)  
- React Query  
- React Router  

### 🧠 Backend
- Node.js + Express  
- TypeScript  
- MongoDB + Mongoose  
- JWT Auth  
- Pino Logging  
- Zod Validation  

### 🤖 AI Providers
- **Google Gemini (Primary)**
- OpenAI
- Dialogflow ES
- Mock Provider (Deterministic for Testing)

---

## ⚡ Quick Start

### ✅ Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (optional)
- MongoDB (if not using Docker)

### 1️⃣ Clone & Install

```bash
cd my-project/CapstoneProject
pnpm install
````

### 2️⃣ Set Up Environment Variables

```bash
cp .env.example .env
```

Set at minimum inside `.env`:

* `JWT_SECRET` (32+ chars)
* `GEMINI_API_KEY` – from Google AI Studio: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### 3️⃣ Start MongoDB

**Option A: Docker (Recommended)**

```bash
cd docker
docker compose up -d mongo
```

Optional UI:

```bash
docker compose --profile tools up -d mongo-express
# http://localhost:8081  (admin/admin)
```

**Option B: Local MongoDB**
Ensure running on port `27017`.

### 4️⃣ (Optional) Seed Database

```bash
pnpm seed
```

Demo User:
Email: `demo@example.com`
Password: `demo123456`

### 5️⃣ Start Development

```bash
pnpm dev
```

Or separately:

```bash
pnpm --filter @apps/api dev     # API on http://localhost:4000
pnpm --filter @apps/web dev     # Web on http://localhost:5173
```

### 6️⃣ Open App

* Web UI → [http://localhost:5173](http://localhost:5173)
* API → [http://localhost:4000](http://localhost:4000)
* Mongo Express → [http://localhost:8081](http://localhost:8081)

---

## 🐳 Docker Deployment

```bash
cd docker
docker compose --profile docker up -d
```

Starts:

* API
* Web
* MongoDB
* Mongo Express (optional)

---

## 🔧 Configuration

### Gemini (Default Provider)

```env
GEMINI_API_KEY=your_key_here
```

Restart API after adding keys.

---

## 📡 API Endpoints

### Auth

| Method | Endpoint             | Description  |
| ------ | -------------------- | ------------ |
| POST   | `/api/auth/register` | Register     |
| POST   | `/api/auth/login`    | Login        |
| POST   | `/api/auth/logout`   | Logout       |
| GET    | `/api/auth/me`       | Current user |

### Chat

| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| POST   | `/api/chat`        | Non-streaming response |
| POST   | `/api/chat/stream` | SSE streaming response |

### Sessions

| Method | Endpoint                            | Description    |
| ------ | ----------------------------------- | -------------- |
| GET    | `/api/sessions`                     | List sessions  |
| POST   | `/api/sessions`                     | Create session |
| GET    | `/api/sessions/:id`                 | Get session    |
| POST   | `/api/sessions/:id/clear`           | Clear messages |
| POST   | `/api/sessions/:id/summarize`       | Summarize chat |
| GET    | `/api/sessions/messages?sessionId=` | Messages       |
| GET    | `/api/sessions/export/:id`          | Export         |

---

## 📂 Project Structure

```bash
.
├── Documentation/          # Report, PPT, Code (Added for Capstone)
├── apps/
│   ├── api/                # Backend
│   └── web/                # Frontend
├── docker/                 # Docker configs
└── .env.example
```

---

## 🧪 Testing

```bash
pnpm test                       # All tests
pnpm --filter @apps/api test     # Backend
pnpm --filter @apps/web test     # Frontend
```

Mock provider requires no keys and ensures deterministic tests.

---

## 🛑 Troubleshooting (Quick)

* **401 Auth:** Clear cookies, re-login, check JWT_SECRET
* **Mongo Fail:** Check container health or connection string
* **Provider Disabled:** Missing API Key in `.env`
* **SSE Not Streaming:** CORS headers or proxy issue

---

## 🚀 Production Security Checklist

* ✅ Strong `JWT_SECRET` (32+ chars)
* ✅ Enable HTTPS + `COOKIE_SECURE=true`
* ✅ Restrictive CORS
* ✅ Rate Limiting
* ✅ MongoDB Auth Enabled
* ✅ Monitoring enabled

---

## 📜 License

MIT
All rights reserved with **Authors:** Gurkirat Singh (23BAI70476) & Riya Kashyap (23BAD10002)
---
