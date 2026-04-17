# 🧠 AI Project Context — Audiary

## 📌 Project Overview

Audiary is an **offline-first Progressive Web App (PWA)** that converts text into audiobooks using **on-device Text-to-Speech (TTS)**.

The system prioritizes:

- Offline capability
- Low infrastructure cost
- Privacy (client-side processing)
- Progressive streaming of audio

---

## 🧱 Architecture Overview

### Frontend

- Framework: Nuxt 3 (Vue 3)
- Deployment: Vercel
- Responsibilities:
  - UI rendering
  - Text ingestion and display
  - TTS processing using `piper-tts-web`
  - Audio playback (Web Audio API)
  - Offline storage (IndexedDB + Service Worker)

---

### Backend

- Framework: NestJS
- Deployment: Render
- Responsibilities:
  - Book and chapter metadata APIs
  - User progress tracking
  - Optional audio sync (future)
  - Thin orchestration layer (no heavy processing)

---

### Database & Storage

- Platform: Supabase
- Components:
  - Postgres → metadata (books, chapters, progress)
  - Storage → optional audio files
  - Auth → optional user system

---

### TTS Engine

- Library: `piper-tts-web`
- Execution: Client-side (WASM)
- Behavior:
  - Converts text chunks → audio buffers
  - Runs entirely in browser
  - Requires model loading and caching

---

## 🔁 Core Data Flow

1. User selects or uploads text (txt, md, pdf)
2. PDFs are parsed client-side using `pdfjs-dist`
3. Text is split into **small chunks (300–800 chars)**
4. Each chunk is processed via TTS (client-side)
5. Audio is:
   - Played immediately
   - Cached locally (IndexedDB)

6. Next chunk is generated in background
7. Playback continues seamlessly

---

## 📁 Monorepo Structure

```text
apps/
  web/        → Nuxt frontend
  api/        → NestJS backend

packages/
  types/      → shared TypeScript types

infra/
  supabase/   → schema and migrations
```

---

## 🧩 Key Concepts

### 1. Chunked Audio Pipeline

- Never process full chapters at once
- Use small text chunks
- Enables streaming and responsiveness

---

### 2. Offline-First Design

- App must work without network
- Cache:
  - TTS models
  - Generated audio
  - App shell

---

### 3. TTS Abstraction Layer

- Do NOT call `piper-tts-web` directly everywhere
- Use a service wrapper (`TTSService`)
- Allows swapping implementation later

---

### 4. Separation of Concerns

- Frontend handles:
  - TTS
  - Playback

- Backend handles:
  - Metadata
  - Sync

- No heavy backend computation

---

## ⚙️ Development Principles

- Prefer **client-side computation over server cost**
- Avoid premature backend complexity
- Keep backend stateless and lightweight
- Use shared types across frontend/backend
- Optimize for perceived performance (streaming UX)

---

## 🚫 Anti-Patterns (Avoid)

- Generating full audiobook at once
- Blocking UI during TTS processing
- Tight coupling between frontend and backend
- Storing large audio files unnecessarily
- Embedding third-party libraries manually (use dependencies)

---

## 🔮 Future Enhancements

- Server-side TTS (optional scaling path)
- Background job queue (BullMQ)
- Multi-voice and language support
- Recommendation engine
- Pre-generated audiobooks

---

## 🧪 Expected AI Assistance

When assisting this project, AI should:

- Respect offline-first constraints
- Suggest chunk-based processing strategies
- Avoid heavy backend solutions unless necessary
- Prefer composables/services in frontend
- Follow modular NestJS architecture in backend
- Keep solutions simple and maintainable

---

## 📎 Important Notes

- Target is **personal usage**, not large-scale SaaS
- Performance on low-end devices is important
- Initial TTS model load is a known constraint
- UX smoothness is more important than raw speed

---
