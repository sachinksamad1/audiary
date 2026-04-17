# Audiary - Project Execution Plan

Based on the [README.md](../README.md) and [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), this plan details the steps to build and deploy Audiary.

## ✅ Phase 1: Shared Foundation (Complete)

- [x] Create `@audiary/types` package for cross-app type safety.
- [x] Set up common data models for Books, Chapters, and TTS processing.
- [x] Configure TypeScript workspace path mappings.

## ✅ Phase 2: Database Layer (Complete)

- [x] Define Drizzle ORM schema with `books`, `chapters`, and `reading_progress`.
- [x] Implement relationships (One-to-many from Books to Chapters).
- [x] Add indexes for performance (Unique index on book progress).

## ✅ Phase 3: Backend API (Complete)

- [x] NestJS application structure with feature modules and DTOs.
- [x] Implement Books, Chapters, and Progress controllers and services.
- [x] Configure global validation pipes and API prefix.
- [x] Setup environment variables for Supabase (Awaiting user to fill `.env`).

## ✅ Phase 4: Frontend Development (Complete)

- [x] Nuxt 3 (Nuxt 4 layout) with custom design system (CSS variables, dark mode).
- [x] Core composables: `useApi`, `useBooks`, `useTTS`, `useAudioPlayer`, `useOfflineStorage`.
- [x] Key components: `BookCard`, `ChapterList`, `AudioPlayer`, `AddBookModal`.
- [x] Core page routing: `/`, `/books/:id`, `/player/:id`.
- [x] Implement robust PWA features with `@vite-pwa/nuxt`.
- [x] Integrate `piper-tts-web` via `TTSService`.

## 🏃 Phase 5: PWA & Offline Experience (In Progress)

- [x] Configure Service Worker strategy for TTS model caching.
- [x] Finalize IndexedDB storage for progressive audio caching (Integrated in `useOfflineStorage`).
- [ ] Implement "Install to Home Screen" UX (Custom prompt if needed).
- [ ] Verify offline playback with service worker.

## 🚀 Phase 6: Deployment & Polish

- [ ] Deploy backend to Render (`apps/api`).
- [ ] Deploy frontend to Vercel/Netlify (`apps/web`).
- [ ] Final UI/UX polish and cross-device testing.

---

### 🔧 To proceed:

1. **Supabase Credentials**: Update the `.env` file at the root with `DATABASE_URL` and `SUPABASE_URL`.
2. **Environment Setup**: Run `pnpm install` then `pnpm dev` to start the workspace.
3. **TTS Assets**: The project is configured to automatically copy TTS assets to the public folder on build/dev.
