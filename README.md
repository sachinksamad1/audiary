# 🎧 Audiary — Personal AI Audiobook PWA

Audiary is an **offline-first Progressive Web App (PWA)** that converts text into natural-sounding audiobooks using on-device Text-to-Speech (TTS).

Built for personal use, it focuses on **privacy, performance, and simplicity** — generating audio directly in the browser using `piper-tts-web`, with optional cloud sync via Supabase.

---

## 🚀 Features

- 📖 Convert text, chapters, or books into audio
- 🔊 On-device TTS (no server cost, privacy-first)
- ⚡ Progressive audio generation (chunk-based streaming)
- 📦 Offline support via PWA + IndexedDB
- 🔁 Resume playback & track progress
- ☁️ Optional sync with Supabase (books, progress, storage)

---

## 🧱 Tech Stack

### Frontend

- Nuxt 3 (Vue 3)
- Vite + PWA (`@vite-pwa/nuxt`)
- IndexedDB (offline audio storage)
- Web Audio API

### Backend

- NestJS (lightweight API layer)
- Hosted on Render

### Database & Storage

- Supabase (Postgres + Storage + Auth)

### TTS Engine

- `piper-tts-web` (WASM-based local TTS)

---

## 📁 Project Structure

```
audiary/
├── apps/
│   ├── web/        # Nuxt 3 PWA (frontend)
│   └── api/        # NestJS backend
├── packages/
│   └── database/   # Drizzle ORM schema & client
├── infra/
│   └── supabase/   # DB migrations (optional)
├── .env.example
├── pnpm-workspace.yaml
└── README.md
```

---

## ⚙️ Setup & Development

### Prerequisites

- [vfox](https://vfox.lxsmnspy.com/) — Multi-version runtime manager
- Node.js (v24.14.0, managed via `vfox`)
- pnpm (managed via `corepack`)
- Supabase account (for database & storage)

---

### 🛠 Environment Setup

#### 1. Node.js with vfox

This project uses `.vfox.toml` and `.tool-versions` to manage runtime versions.

```bash
# Install vfox nodejs plugin
vfox add nodejs

# Install and use the version specified in the config files
vfox install
```

#### 2. pnpm with Corepack

We use Node's built-in `corepack` to manage `pnpm`.

```bash
# Enable corepack
corepack enable

# Prepare and activate pnpm
corepack prepare pnpm@latest --activate
```

> [!TIP]
> If `pnpm` is not found after activation, ensure your shell's `PATH` includes the corepack shims directory. For many users, this is `~/.local/bin` or the path managed by `vfox`.

#### 3. Install Dependencies

```bash
pnpm install
```

---

### 2. Environment Variables

Create `.env` in root:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
DATABASE_URL=

APP_URL=http://localhost:3000
API_URL=http://localhost:4000/api
```

---

### 3. Run Development

Run both frontend and backend:

```bash
pnpm dev
```

Alternatively, run separately:

```bash
# frontend
pnpm --filter web dev

# backend
pnpm --filter api dev
```

### 4. Database Management

```bash
# generate migrations
pnpm db:generate

# push schema to database
pnpm db:push

# open drizzle studio
pnpm db:studio
```

---

## 🔊 TTS Pipeline

1. Text is split into **small chunks (300–800 chars)**
2. Each chunk is processed via `piper-tts-web`
3. Audio is:
   - Played immediately
   - Cached in IndexedDB

4. Next chunk is preloaded for seamless playback

---

## 📴 Offline-First Architecture

- TTS runs entirely in-browser (WASM)
- Audio chunks stored locally
- Service Worker caches:
  - App shell
  - TTS models
  - Generated audio

---

## ☁️ Supabase Integration

Used for:

- 📚 Book & chapter metadata
- 📍 User progress tracking
- 🎵 Optional audio storage (cloud sync)

---

## 🚀 Deployment

### Frontend (Vercel)

- Root Directory: `apps/web`
- Build Command:

```bash
pnpm build
```

- Output:

```
.output
```

---

### Backend (Render)

- Root Directory: `apps/api`
- Build Command:

```bash
pnpm install && pnpm build
```

- Start Command:

```bash
node dist/main.js
```

---

## ⚠️ Known Limitations

- Initial TTS model download can be large (~50–100MB)
- Performance depends on device CPU (mobile optimization needed)
- Long texts must be chunked to avoid blocking UI

---

## 🧠 Design Philosophy

- **Offline-first > Cloud-first**
- **Client compute > Server cost**
- **Simple architecture > Over-engineering**

---

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome.

---

## 📄 License

MIT License

---

## ✨ Acknowledgements

- Piper TTS (open-source voice synthesis)
- Supabase (backend-as-a-service)
- Nuxt & NestJS ecosystems

---
