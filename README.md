# Vasu Sir Accountancy — Coaching Institute Management

A multi-page coaching-institute web app for a CBSE Class 11 & 12 **Accountancy**
coaching center. Two roles — **Student** and **Staff** — log into separate
dashboards covering attendance, notes, fees, a built-in MCQ quiz engine and a
live leaderboard.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind + shadcn-style
UI**, **NextAuth (credentials)**, **Prisma + SQLite**, **Zustand**, **recharts**,
**framer-motion** and **Playwright** for screenshot-driven UI iteration.

---

## Features

**Student** (`/dashboard`)
- At-a-glance tiles: attendance ring, pending fees, last quiz score, class rank.
- **Attendance** — month calendar (present / absent / holiday / no-class) + summary.
- **Notes** — chapter-wise material, search, tag filters, class tabs, downloads.
- **Fees** — total / paid / pending / next-due cards, installment table (overdue in red), receipts.
- **Quiz** — chapter hub, configurable MCQ runner (timer, palette, mark-for-review), scored result page with per-question review.
- **Leaderboard** — overall / per-class / per-chapter, time filters, top-3 podium, highlighted + sticky self row.

**Staff** (`/staff`)
- KPI tiles + recent activity + quick actions.
- **Attendance** — pick class & date, mark each student, "Mark all present".
- **Notes** — upload (dev-stubbed) and delete material.
- **Fees** — edit installment status, add installments, send reminders.
- **Students** — roster with attendance %, pending fees, quiz counts.
- **Question bank** — full CRUD over the MCQ bank, plus **Generate with AI** (Claude Haiku).

### AI question generation (staff only)
Staff can draft MCQs with **Claude Haiku** from the question bank ("Generate with
AI"): pick chapter / count / difficulty → the model returns drafts via strict tool
use (guaranteed shape) → staff **review and edit** them → **Publish to bank**.

- Generation ([`src/lib/ai.ts`](src/lib/ai.ts)) and publishing are **separate, both
  staff-gated** steps — `POST /api/questions/generate` only drafts (never writes to
  the DB), and `POST /api/questions/publish` is the only path that persists them.
  Students and unauthenticated users get `401` on both.
- Set `ANTHROPIC_API_KEY` in `.env` to enable it. Left blank, the generate endpoint
  returns `503` and the rest of the app is unaffected. Model: `claude-haiku-4-5`.

---

## Tech & data model notes

- **Auth**: NextAuth credentials provider, JWT sessions. `middleware.ts` gates
  `/dashboard/*` (students) and `/staff/*` (staff); the leaderboard is shared.
- **Passwords**: hashed with `bcryptjs`.
- **Money**: stored in **paise** (integer), formatted at render (`formatINR`).
- **Scoring**: leaderboard points formula is documented in
  [`src/lib/scoring.ts`](src/lib/scoring.ts) —
  `round(score% * difficultyMultiplier − timePenalty)`, floored at 0.

### SQLite adaptations (vs. the original spec)
SQLite (the dev DB) does not support Prisma scalar list fields or native enums:
- Enum fields are stored as `String`; allowed values live in
  [`src/lib/enums.ts`](src/lib/enums.ts) and are enforced with zod.
- `Question.options` is a JSON-encoded `string[]`; `QuizAttempt.answers` is a
  JSON-encoded array — both handled in [`src/lib/questions.ts`](src/lib/questions.ts).

To move to Postgres for production, change the `datasource` provider in
`prisma/schema.prisma` to `postgresql`, set `DATABASE_URL`, and you can promote
these columns to native enums / arrays / `Json`.

---

## Setup & run

```bash
# 1. install
npm install

# 2. env
cp .env.example .env
# DATABASE_URL="file:./dev.db"
# NEXTAUTH_SECRET="change-me"
# NEXTAUTH_URL="http://localhost:3000"

# 3. database: migrate + seed
npx prisma migrate dev --name init
npx prisma db seed         # creates users, attendance, fees, notes, question bank

# 4. dev server
npm run dev                # http://localhost:3000
```

### Regenerating the question bank
The bank lives as one JSON file per chapter under `data/questions/`. To
regenerate the files from the curated source, run:

```bash
npx tsx scripts/generate-questions.ts
```

The seed loads them via `scripts/seed-questions.ts` (chapterId/class derived from
the file name), so expanding the bank is just adding objects to the JSON files.

---

## Demo accounts (created by the seed)

| Role | Email | Password |
|---|---|---|
| Staff (admin) | `admin@coach.local` | `admin123` |
| Staff | `staff@coach.local` | `staff123` |
| Student | `aarav@coach.local` (and `diya`, `kabir`, `ananya`, `vihaan`) | `student123` |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset + re-migrate + re-seed |
| `npm run test:e2e` | Playwright visual screenshots |
| `npm run test:api` | API tests: AI staff-gating + quiz answer-leak guard |

---

## Screenshot-driven UI iteration

`tests/visual.spec.ts` logs in as a student and as staff, then screenshots every
route at five viewports (375, 414, 768, 1280, 1920) into `tests/screenshots/`
(git-ignored).

```bash
# with `npm run dev` already running on :3000
npx playwright install chromium     # first time only
npm run test:e2e
```

Review the output at each viewport and fix any overflow / spacing / contrast
issues before considering a page done.

---

## Deploying (Vercel + Postgres)

1. Create a Postgres database (Vercel Postgres, Neon, Supabase, etc.).
2. In `prisma/schema.prisma`, set `provider = "postgresql"`. Optionally promote
   `Question.options` / `QuizAttempt.answers` to native types and the string
   enum fields to Prisma enums.
3. Set env vars on Vercel: `DATABASE_URL`, `NEXTAUTH_SECRET` (a strong random
   value), `NEXTAUTH_URL` (your deployment URL).
4. Run `prisma migrate deploy` and `prisma db seed` against the prod DB.
5. Deploy. Build command `prisma generate && next build`.

> Note: notes upload and receipt download are **stubbed** in dev (placeholder
> URLs under `public/uploads/`). Wire them to real storage (e.g. S3 / Vercel
> Blob) for production.

---

## Out of scope (per spec)

Payment-gateway integration, live video classes, chat/messaging, push
notifications, and multi-institute support are intentionally not built.
# Vasu-sir
