# UI Review — Vasu Sir Accountancy Coaching

Polish pass for the existing app. The design is already on-theme and coherent — this is **consistency + readability work, not a redesign.** Token names below refer to `THEME.md`. Work top to bottom: P0 are global rules that fix most screens at once, then per-page tweaks.

---

## P0 — Global (fixes most pages at once)

### 1. Fix low-contrast text
Several secondary texts and stat values are too dim to read comfortably (worst on the student dashboard's right-hand cards, the calendar, and icon-tile labels).

- Body/secondary text → minimum `--color-body` (`#CBC8C1` on dark surfaces). Never go below `--color-muted` for anything a user needs to read.
- Stat **values** (the big numbers like ₹18,000, 50%, #2) → `--color-ink` on dark (`#F0EFEC`), full weight. They're the point of the card; make them loud.
- Stat **labels** ("Pending fees", "Class rank") → `--color-body`, not a dim tint.
- Target: every text/background pair clears **WCAG AA (4.5:1)**. Quick check the three dim dashboard cards first.

### 2. Establish ONE button system and apply it everywhere
Right now filled sage buttons are used for everything, so hierarchy is flat. Define three roles and use them by *intent*, not by habit:

| Role | Style | Use for |
|------|-------|---------|
| **Primary** | Solid `--color-primary` (`#0E4651`), text `#F0EFEC` | The main action on a screen (Save attendance, Start quiz on the focused card) |
| **Accent** | Solid `--color-accent` (`#D2A24A`), text `#1C1A17` | **One per view max** — the single highest-value action (Go to quizzes, Add MCQ) |
| **Secondary / ghost** | Transparent, `1px` `--color-line` border, text `--color-body` | Everything else (Retake, filters, View fees) |

Rule of thumb: if every button on a page looks important, none of them do. Demote the sage fills to ghost buttons, keep gold scarce.

### 3. Lock semantic colours
Use the exact same mapping on every page — badges, pills, icon tiles, text:

- **Paid / Present / correct answer** → success `#2E7D5B` (bg tint `#E6F2EC` → on dark, use teal-tinted equivalents)
- **Pending / due soon** → warning `#C2620E`
- **Overdue / absent / error** → error `#B23A2E`

Fix the **Fees summary**: the "Pending" card currently shows a red `(!)` icon while the table pill is amber. Make the card icon amber too.

### 4. Calm the icon tiles
The small rounded icon tiles behind stats are muddy and inconsistent. Standardise:

- Tile background = the relevant token at ~12–15% opacity (e.g. teal-tint for neutral stats, amber-tint for fees-due, red-tint for overdue).
- Icon stroke = the token at full strength, so it's clearly legible.
- Same corner radius and size across all cards.

---

## P1 — Per page

### Student · Dashboard
- The Attendance card (green ring) looks great; bring the other three cards up to that level — they currently look half-disabled. Same value weight, same label contrast.
- Keep **Go to quizzes** as the only gold button on the page. Good as is.
- The fee-due banner at the bottom: make the amber `(i)` icon and the "View fees" ghost button match the P0 button + semantic rules.

### Student · Attendance
- Calendar readability is the issue: green day-numbers on green-tinted cells is hard to scan. Raise the number contrast (use `--color-ink`/`--color-body` for normal days; reserve colour only for Present/Absent **states**, shown as a small dot or left-border, not by tinting the whole cell + the number).
- "Today" (22) gold ring is a nice touch — keep it, it's a good signature.
- Present / Absent / Holiday summary tiles: apply the standardised icon-tile treatment and lift the count numbers to `--color-ink`.

### Student · Notes
- Solid screen. Filter chips: active = subtle solid, inactive = ghost — make sure the active one is clearly distinct (right now "All" vs the rest is a little weak).
- Tag badges (Reference, Worksheet, Previous-Year Paper) should use a consistent muted style, not compete with the gold accent. A quiet neutral or teal-tint badge is right here.
- Make the whole file card clickable, with the download icon as a secondary affordance.

### Student · Quiz
- This page has the most button-overuse. Most "Start quiz" buttons → **ghost**. The "Random mix → Start" is arguably the page's primary action; consider making just that one gold, and leave the chapter buttons quiet.
- Score badges (25% / 50% / 60%) read as gold "achievements" — fine, but they're easy to confuse with the accent button colour. Consider tying badge colour to performance (red < 40, amber 40–69, green ≥ 70) so the colour carries meaning.

### Student · Leaderboard
- Strongest page already. Podium hierarchy is clear (1st centre, gold trophy). Keep it.
- Only nit: the bronze/silver medals and the gold trophy should sit on the same shape/size so the rank is read by *position + colour*, consistently.

### Student · Fees
- Fix the Pending icon colour (see P0 #3).
- The installment table is clean. Make the "PDF" receipt link a ghost/secondary style and the em-dash placeholders `--color-muted` so empty cells recede.

### Staff · Dashboard
- "Present today: 0" looks like a bug at a glance. If it's genuinely zero (no class marked yet), add a tiny helper line ("No attendance marked yet") so the zero reads intentional.
- Quick-action tiles: give them a hover state (lift + `--color-primary` border) so they read as buttons.
- "Recent quiz activity" scores (1/2, 3/5): colour the fraction by pass/fail using the same performance thresholds as the quiz badges, for consistency.

### Staff · Mark attendance
- Present = solid green works. Make Absent/Holiday ghost buttons that fill with their semantic colour (red / neutral) **only when selected**, so the active state is obvious.
- "Save attendance" is the page's primary action → make it Primary (solid teal), not sage. "Mark all present" → secondary.

### Staff · Students
- Good dense table. Keep attendance %, pending-fees, and quiz columns colour-coded (green for ₹0, red for owed) — that's working.
- Add zebra striping or a hover row-highlight (`--color-surface-tint`) for scanability.

### Staff · Question bank
- "Generate with AI" and "Add MCQ" are both prominent — pick one as Accent (gold) and make the other Primary/ghost, so there's a single dominant action.
- Correct-answer cells (green check) are clear. Make the difficulty badge colours meaningful and consistent: Easy = success green, Medium = warning amber, Hard = error red.

### Staff · Manage notes / Manage fees
- Forms: label every field with `--color-body`, inputs with `--color-line` borders and `--color-surface` fill; focus state = `--focus-ring` (gold) outline. Consistent with the rest.
- Manage fees: the per-installment **status dropdown** and the **status pill** should always agree in colour. Disabled "Remind" on a ₹0-pending student is the right call — keep it visibly disabled (`--color-muted`).

---

## P2 — Nice-to-have

- **Motion, sparingly:** a single page-load fade/stagger on cards, and hover micro-lifts on clickable cards. Respect `prefers-reduced-motion`. Don't animate everything — restraint reads premium.
- **Empty states:** notes with no files, leaderboard with no quizzes taken, fees fully paid — each should say what to do next, in the interface's voice ("No notes here yet. New material appears as your teacher uploads it.").
- **Tabular numbers:** set all the ₹ amounts, percentages, and scores in a mono / tabular-figure style (`font-variant-numeric: tabular-nums`) so columns align. This is the one small signature that makes an accounting product *feel* like an accounting product.
- **Focus visibility:** make sure keyboard focus is visible everywhere (gold `--focus-ring`), since this is a real product students and staff will tab through.

---

## What NOT to change
- The serif headings + dark teal direction — it's working, don't touch it.
- The "today" gold ring on the calendar, the leaderboard podium, the green attendance ring — these are your good signature moments. Keep them.
- Don't add a fourth brand colour or a money-green. Two brand colours + semantics is the discipline that makes it look professional.
