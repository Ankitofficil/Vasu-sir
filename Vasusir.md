# Coaching Institute Management Website — Project Spec

> This file is the source of truth for Claude Code. Read it fully before writing or modifying code. Re-read after any structural change.

---

## 1. Project Overview

A multi-page coaching institute management web app for an Accountancy coaching center (CBSE Class 11 & 12). Two user roles — **Student** and **Staff** — log into separate dashboards. Students take attendance-tracked classes, access notes, see fee status, attempt MCQ quizzes from a built-in question bank, and compete on a leaderboard. Staff manage everything.

The app must be fully responsive (mobile-first, scales cleanly to desktop) and the build loop must include **screenshot-driven UI iteration** at every milestone.

---

## 2. Tech Stack (recommended — adjust only if asked)

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Auth**: NextAuth.js (credentials provider, JWT sessions)
- **Database**: SQLite via Prisma ORM (easy local dev; swap to Postgres for prod)
- **State**: React Server Components + Zustand for client-side quiz/leaderboard state
- **Icons**: lucide-react
- **Charts**: recharts (for dashboard analytics)
- **Screenshots for iteration**: Playwright (`npx playwright test` with `page.screenshot()`) — see Section 11

---

## 3. Pages & Routes

| Route | Page | Access |
|---|---|---|
| `/` | Landing / marketing page | Public |
| `/login` | Unified login (role toggle: Student / Staff) | Public |
| `/register` | Student self-register (staff accounts created by admin) | Public |
| `/dashboard` | Student dashboard | Student |
| `/dashboard/attendance` | View own attendance history + % | Student |
| `/dashboard/notes` | Browse / download notes & study material | Student |
| `/dashboard/fees` | Fee paid / pending breakdown + history | Student |
| `/dashboard/quiz` | Quiz hub — pick chapter, start MCQ test | Student |
| `/dashboard/quiz/[chapterId]` | Active quiz screen | Student |
| `/dashboard/quiz/result/[attemptId]` | Quiz result + review | Student |
| `/dashboard/leaderboard` | Class-wise leaderboard | Student + Staff |
| `/staff` | Staff dashboard | Staff |
| `/staff/attendance` | Mark attendance for a class/date | Staff |
| `/staff/notes` | Upload / edit / delete study material | Staff |
| `/staff/fees` | Update fee status per student | Staff |
| `/staff/students` | Manage student records | Staff |
| `/staff/question-bank` | Add / edit MCQs in the bank | Staff |
| `/api/*` | REST endpoints (auth, attendance, quiz, fees, etc.) | Role-gated |

---

## 4. Feature Specifications

### 4.1 Authentication (`/login`)
- Single page, toggle pill at top: **Student** | **Staff**.
- Email + password. "Remember me" + "Forgot password" links.
- On submit, route to `/dashboard` (student) or `/staff` (staff) based on role.
- Middleware (`middleware.ts`) protects all `/dashboard/*` and `/staff/*` routes.
- Show inline validation errors. No alerts.

### 4.2 Student Dashboard (`/dashboard`)
Landing tile grid showing at-a-glance:
- Attendance % (circular progress ring)
- Pending fees amount (red if >0, green if 0)
- Last quiz score
- Current leaderboard rank
- "Continue last activity" CTA
- Upcoming class card (next scheduled class)

Sidebar nav (collapsible on mobile → bottom nav): Dashboard, Attendance, Notes, Fees, Quiz, Leaderboard, Logout.

### 4.3 Attendance (`/dashboard/attendance`)
- Calendar view (month grid) with each day colored: green=present, red=absent, gray=no class, blue=holiday.
- Summary card: Total classes, Present, Absent, Attendance %.
- Filter by month / chapter / subject.
- Staff side (`/staff/attendance`): pick date + class → checkbox list of enrolled students → "Mark All Present" toggle → Save.

### 4.4 Notes & Study Material (`/dashboard/notes`)
- Folder tree: **Class 11** / **Class 12** → chapter folders → files (PDF, PPT, video links).
- Each item: title, type icon, size, uploaded date, download button, "preview" (PDF inline viewer).
- Search bar (filters by filename + chapter).
- Tag filter: Notes, Worksheet, Previous-Year Paper, Reference.
- Staff upload form: file picker, class, chapter, tag, title, description.

### 4.5 Fees (`/dashboard/fees`)
- Top summary cards: **Total Fee**, **Paid**, **Pending**, **Next Due Date**.
- Installment table: Installment #, Due Date, Amount, Status (Paid / Pending / Overdue), Paid On, Receipt link.
- Pending rows highlighted; overdue rows in red.
- Download receipt as PDF (button per paid row).
- Staff side: edit any row's status, add new installment, send reminder.

### 4.6 Quiz / MCQ Section (`/dashboard/quiz`)
**Hub page**:
- Two tabs: Class 11 / Class 12.
- Grid of chapter cards (list in Section 5). Each card shows: chapter name, # of questions available, best score, last attempt date, "Start Quiz" button.
- Quick filter: "Random Mix (all chapters)", "Untouched chapters only".

**Quiz page** (`/dashboard/quiz/[chapterId]`):
- Configurable: # of questions (10 / 20 / 30 / all), timer per question (default 60s) or total timer, difficulty filter (easy/medium/hard/all).
- One question per screen with 4 options. Progress bar at top. Timer ring. Mark for review, Skip, Next.
- Question palette (side drawer on desktop, bottom sheet on mobile) showing answered/unanswered/marked.
- Submit → result page.

**Result page** (`/dashboard/quiz/result/[attemptId]`):
- Score, %, time taken, accuracy, rank against class average.
- Per-question review: question, your answer, correct answer, explanation.
- "Retry wrong only", "Retry full", "Back to hub" buttons.
- Result auto-feeds leaderboard.

### 4.7 Leaderboard (`/dashboard/leaderboard`)
- Toggle: **Overall** / **Class 11** / **Class 12** / **Per chapter**.
- Time filter: All time / This month / This week.
- Top 3 podium UI (gold/silver/bronze cards).
- Ranked table below (rank, name, avatar, total points, quizzes taken, accuracy %).
- Highlight the logged-in student's row + sticky-pin it at bottom even when off-screen.
- Points formula: `score % * difficulty_multiplier - time_penalty`. Document the exact formula in `lib/scoring.ts`.

### 4.8 Staff Dashboard (`/staff`)
- KPI tiles: Total students, Active today, Avg attendance %, Total fees collected this month, Fees overdue count.
- Recent activity feed.
- Quick actions: Mark today's attendance, Add MCQ, Upload notes, Send fee reminder.

---

## 5. Built-in Question Bank — CBSE Accountancy

The bank ships seeded via `prisma/seed.ts`. Each MCQ has: `id`, `class` (11 | 12), `chapterId`, `question`, `options[4]`, `correctIndex`, `difficulty` (easy | medium | hard), `explanation`, `marks` (default 1).

**Class 11 chapters** (seed at least 25 MCQs per chapter, mix of difficulties):
1. Introduction to Accounting
2. Theory Base of Accounting
3. Recording of Transactions – I (Journal)
4. Recording of Transactions – II (Ledger, Cash Book)
5. Bank Reconciliation Statement
6. Trial Balance and Rectification of Errors
7. Depreciation, Provisions and Reserves
8. Bills of Exchange
9. Financial Statements – I (without adjustments)
10. Financial Statements – II (with adjustments)
11. Accounts from Incomplete Records
12. Applications of Computers in Accounting
13. Computerised Accounting System

**Class 12 chapters** (seed at least 25 MCQs per chapter):

*Part A — Accounting for Partnership Firms and Companies*
1. Accounting for Partnership: Basic Concepts
2. Reconstitution of Partnership — Change in Profit-Sharing Ratio
3. Reconstitution of Partnership — Admission of a Partner
4. Reconstitution of Partnership — Retirement / Death of a Partner
5. Dissolution of Partnership Firm
6. Accounting for Share Capital
7. Issue and Redemption of Debentures

*Part B — Analysis of Financial Statements*
8. Financial Statements of a Company
9. Analysis of Financial Statements
10. Accounting Ratios
11. Cash Flow Statement

Provide a `scripts/seed-questions.ts` that loads from `data/questions/class-11/*.json` and `data/questions/class-12/*.json`. Use one JSON file per chapter so it's trivial to expand later.

---

## 6. Database Schema (Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String
  role          Role     // STUDENT | STAFF
  class         Int?     // 11 or 12, nullable for staff
  rollNo        String?  @unique
  avatarUrl     String?
  createdAt     DateTime @default(now())
  attendance    Attendance[]
  feeRecords    FeeRecord[]
  attempts      QuizAttempt[]
}

enum Role { STUDENT STAFF }

model Attendance {
  id        String   @id @default(cuid())
  studentId String
  date      DateTime
  status    AttStatus // PRESENT | ABSENT | HOLIDAY
  classOf   Int       // 11 | 12
  markedBy  String    // staff userId
  student   User     @relation(fields: [studentId], references: [id])
  @@unique([studentId, date])
}

enum AttStatus { PRESENT ABSENT HOLIDAY }

model NoteMaterial {
  id          String   @id @default(cuid())
  title       String
  description String?
  classOf     Int
  chapterId   String
  tag         String   // NOTES | WORKSHEET | PYQ | REFERENCE
  fileUrl     String
  fileType    String
  sizeKb     Int
  uploadedBy  String
  createdAt   DateTime @default(now())
}

model FeeRecord {
  id          String   @id @default(cuid())
  studentId   String
  installment Int
  amount      Int
  dueDate     DateTime
  paidOn      DateTime?
  status      FeeStatus // PAID | PENDING | OVERDUE
  receiptUrl  String?
  student     User     @relation(fields: [studentId], references: [id])
}

enum FeeStatus { PAID PENDING OVERDUE }

model Question {
  id            String     @id @default(cuid())
  classOf       Int
  chapterId     String
  question      String
  options       String[]   // length 4
  correctIndex  Int
  difficulty    Difficulty
  explanation   String
  marks         Int        @default(1)
}

enum Difficulty { EASY MEDIUM HARD }

model QuizAttempt {
  id           String   @id @default(cuid())
  studentId    String
  chapterId    String?  // null = mixed
  classOf      Int
  score        Int
  totalMarks   Int
  timeTakenSec Int
  answers      Json     // [{questionId, chosenIndex, correct}]
  createdAt    DateTime @default(now())
  student      User     @relation(fields: [studentId], references: [id])
}
```

---

## 7. File / Folder Structure

```
.
├── CLAUDE.md                  ← this file
├── README.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── data/
│   └── questions/
│       ├── class-11/
│       │   ├── 01-introduction.json
│       │   ├── 02-theory-base.json
│       │   └── ...
│       └── class-12/
│           ├── 01-partnership-basics.json
│           └── ...
├── public/
│   ├── logo.svg
│   └── uploads/               ← notes & receipts (dev only)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           ← landing
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/         ← student area
│   │   │   ├── layout.tsx     ← sidebar + bottom nav
│   │   │   ├── page.tsx
│   │   │   ├── attendance/
│   │   │   ├── notes/
│   │   │   ├── fees/
│   │   │   ├── quiz/
│   │   │   └── leaderboard/
│   │   ├── staff/             ← staff area
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── attendance/
│   │   │   ├── notes/
│   │   │   ├── fees/
│   │   │   ├── students/
│   │   │   └── question-bank/
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── attendance/route.ts
│   │       ├── notes/route.ts
│   │       ├── fees/route.ts
│   │       ├── quiz/route.ts
│   │       └── leaderboard/route.ts
│   ├── components/
│   │   ├── ui/                ← shadcn primitives
│   │   ├── layout/
│   │   ├── quiz/
│   │   ├── attendance/
│   │   └── leaderboard/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── scoring.ts
│   │   └── utils.ts
│   ├── hooks/
│   ├── stores/                ← zustand
│   └── types/
├── tests/
│   ├── screenshots/           ← Playwright output, git-ignored
│   └── visual.spec.ts
└── middleware.ts
```

---

## 8. Responsive Design Requirements

**Mobile-first.** Tailwind breakpoints: default = mobile, `sm:` ≥640px, `md:` ≥768px, `lg:` ≥1024px, `xl:` ≥1280px.

Rules:
- All grids collapse to single column under `sm`.
- Sidebar nav becomes a fixed **bottom tab bar** under `md` (5 icons max, overflow into a "More" drawer).
- Tables become stacked cards under `md`.
- Tap targets ≥ 44×44 px.
- Forms use full-width inputs on mobile, two-column on `md+`.
- Quiz: one question per screen on mobile; on desktop show question + palette side by side.
- Test at: 375×667 (iPhone SE), 414×896 (iPhone 11), 768×1024 (iPad), 1280×800 (laptop), 1920×1080 (desktop).

Accessibility: color contrast AA, focus rings visible, keyboard-navigable quiz, ARIA labels on icon-only buttons.

---

## 9. Visual Style

- **Light + Dark mode** (toggle in nav). Use `next-themes`.
- Palette: primary indigo `#4f46e5`, success emerald, warning amber, danger rose, neutral slate.
- Typography: Inter for UI, JetBrains Mono for numbers (scores, fees).
- Card-based layouts, generous whitespace, soft shadows (`shadow-sm`/`shadow-md`), 12px radius default.
- Subtle motion via `framer-motion` on route transitions and result reveal.

---

## 10. Setup & Run

```bash
# install
npm install

# env
cp .env.example .env
# fill DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# db
npx prisma migrate dev --name init
npx prisma db seed

# dev
npm run dev

# test
npm run test            # vitest unit
npm run test:e2e        # playwright with screenshots
```

`.env.example`:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="change-me"
NEXTAUTH_URL="http://localhost:3000"
```

Seed creates: 1 admin staff (`admin@coach.local` / `admin123`), 1 demo staff, 5 demo students across class 11 & 12, sample attendance, fees, notes, and the full question bank.

---

## 11. Screenshot-Driven Iteration Workflow

After scaffolding each page, run Playwright to capture screenshots at 5 viewports and review them before moving on. **Do not consider a page "done" until screenshots are clean at every viewport.**

`tests/visual.spec.ts`:
```ts
import { test } from '@playwright/test';

const viewports = [
  { name: 'mobile-sm', width: 375, height: 667 },
  { name: 'mobile-lg', width: 414, height: 896 },
  { name: 'tablet',    width: 768, height: 1024 },
  { name: 'laptop',    width: 1280, height: 800 },
  { name: 'desktop',   width: 1920, height: 1080 },
];

const routes = [
  '/', '/login', '/dashboard', '/dashboard/attendance',
  '/dashboard/notes', '/dashboard/fees', '/dashboard/quiz',
  '/dashboard/leaderboard', '/staff', '/staff/attendance',
];

for (const route of routes) {
  for (const vp of viewports) {
    test(`${route} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`http://localhost:3000${route}`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: `tests/screenshots/${route.replace(/\//g, '_') || 'home'}_${vp.name}.png`,
        fullPage: true,
      });
    });
  }
}
```

After running, **Claude Code must open each screenshot, list issues (overflow, broken layout, contrast, spacing), and fix them before proceeding.** Repeat until clean.

---

## 12. Build Order (do these in order)

1. Scaffold Next.js project + Tailwind + shadcn + Prisma.
2. Define `schema.prisma`, run migration, write `seed.ts`.
3. Build auth (NextAuth credentials) + login page + middleware.
4. Build student dashboard shell (layout, sidebar/bottom nav, theme toggle).
5. Build staff dashboard shell.
6. Attendance (student view, then staff view).
7. Notes (student view, then staff upload).
8. Fees (student view, then staff edit).
9. Question bank seed + staff CRUD.
10. Quiz hub + active quiz + result page.
11. Leaderboard.
12. Polish: landing page, dark mode, animations.
13. Run Playwright screenshots → fix issues → repeat.
14. README with deploy instructions (Vercel + Postgres).

---

## 13. Coding Conventions

- TypeScript strict mode, no `any`.
- Server Components by default; `'use client'` only when needed (forms, charts, quiz state).
- All forms use `react-hook-form` + `zod` validation.
- API routes return typed responses, use `zod` to validate input.
- Never store plain passwords. Use `bcryptjs`.
- All money in paise (integer), format at render.
- All dates in UTC in DB, format in user TZ at render.
- Comments only where logic is non-obvious. No `console.log` in committed code.

---

## 14. Definition of Done (per feature)

- [ ] Works for student role
- [ ] Works for staff role (where applicable)
- [ ] Mobile (375px) — no horizontal scroll, all tap targets ≥44px
- [ ] Tablet (768px) — clean layout
- [ ] Desktop (1280px+) — uses available width gracefully
- [ ] Dark mode looks intentional
- [ ] Loading + empty + error states present
- [ ] Playwright screenshots at all 5 viewports reviewed and clean
- [ ] No TS errors, no eslint warnings

---

## 15. Out of Scope (don't build unless asked)

- Payment gateway integration (fees are marked manually by staff).
- Live video classes.
- Chat / messaging.
- Push notifications.
- Multi-tenant / multi-institute support.

---

End of spec. When in doubt, ask before assuming.
