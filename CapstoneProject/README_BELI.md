# Branding & Settings (Beli)

This PR rebrands the chatbot to Beli and adds a simple Settings dialog, model selection, and streamlined chat controls.

Quick setup (60 seconds)
- Frontend base URL
  - apps/web/.env.local
    VITE_API_URL=http://localhost:4000
  - Start FE
    pnpm --filter @apps/web dev
- Backend env
  - .env (repo root or apps/api/.env)
    CLIENT_ORIGIN=http://localhost:5173
    PORT=4000
    JWT_SECRET=dev_secret
    COOKIE_SECURE=false
    GEMINI_API_KEY=your_key_here (optional)
  - Start API
    pnpm --filter @apps/api dev

Highlights
- App name: Beli — Your Study Buddy & Uni Companion
- Settings dialog (gear icon): System Prompt + Temperature, persisted per session
- Model select in the top bar (left), with disabled options when provider keys are missing
- Icon buttons in chat: Clear, Summarize, Export
- Inline rename in sidebar
- Auto-create or auto-select a chat on first load