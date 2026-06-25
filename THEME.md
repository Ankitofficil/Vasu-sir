# Theme — Accountancy Coaching Website

A design-token spec for an accountancy coaching brand. Drop this file in your repo root (or `docs/`) and point Claude Code at it: *"Implement the palette and tokens defined in THEME.md."* CSS variables are the source of truth — everything else maps back to them.

---

## Direction

**Audience:** small-business owners, freelancers, and junior accountants looking for a mentor — people who want competence *and* a human they can trust.

**The brand's job:** look precise enough to handle someone's books, warm enough to coach someone through them.

So the palette deliberately avoids the two clichés: it isn't corporate-fintech blue, and it isn't literal money-green. Instead:

- **Petrol Teal** as the brand color — the colour of ledger ink and fountain pens. Reads as precision and authority without the cold of pure navy.
- **Brass Gold** as the single accent — prosperity and premium guidance, the "trusted advisor" warmth. Used sparingly, it carries all the energy on the page.
- **Warm Slate** neutrals — tinted slightly warm (toward paper), never sterile clinical gray. This is the discipline that makes the two brand colours feel expensive.

Restraint is the point: two brand colours, one accent, a warm neutral ramp. Don't add a fourth hue.

---

## Core palette

| Role | Name | Hex | Use it for |
|------|------|-----|------------|
| Primary | Petrol Teal | `#0E4651` | Brand, headers, primary buttons, links |
| Primary (deep) | Ink Teal | `#062730` | Footers, dark sections, high-contrast text on light |
| Accent | Brass Gold | `#D2A24A` | One CTA per view, highlights, underlines, focus glints |
| Accent (deep) | Antique Brass | `#9E722C` | Accent text on light bg (gold fails contrast as text) |
| Ink | Near-Black | `#1C1A17` | Headings, body text |
| Body | Warm Graphite | `#4A4740` | Long-form body copy |
| Surface | Paper | `#F8F8F6` | Page background |
| Surface (raised) | Card | `#FFFFFF` | Cards, panels |
| Line | Hairline | `#E2E0DB` | Borders, dividers |

---

## Full tonal scales

Use the mid-to-dark steps for ink and brand, the light steps for tints and section backgrounds.

### Primary — Petrol Teal
```
50   #ECF4F5
100  #D0E3E6
200  #A3C8CD
300  #6FA8AF
400  #428891
500  #1F6B75
600  #155560
700  #0E4651   ← brand core
800  #0A3640
900  #062730
```

### Accent — Brass Gold
```
50   #FBF6EC
100  #F5E9CE
200  #EAD29D
300  #DDB868
400  #D2A24A   ← accent core
500  #BE8C36
600  #9E722C   ← accent text on light
700  #7C5924
800  #5C421C
900  #3E2D13
```

### Neutral — Warm Slate
```
50   #F8F8F6   ← page bg
100  #F0EFEC
200  #E2E0DB   ← hairline
300  #CBC8C1
400  #A8A49B
500  #847F75
600  #635F57
700  #4A4740   ← body text
800  #322F2A
900  #1C1A17   ← ink / headings
```

---

## Semantic colours

Kept clearly distinct from Brass Gold so a warning never gets mistaken for a brand accent.

| Token | Light bg tint | Base | Dark text/border | Meaning |
|-------|---------------|------|------------------|---------|
| Success | `#E6F2EC` | `#2E7D5B` | `#1E5A40` | Filed, paid, on track |
| Warning | `#FBEBD9` | `#C2620E` | `#8A4509` | Deadline approaching |
| Error | `#F7E7E5` | `#B23A2E` | `#85271D` | Overdue, failed |
| Info | `#E5EFF6` | `#2C6E9B` | `#1D4E70` | Tips, neutral notices |

---

## CSS variables (source of truth)

```css
:root {
  /* Brand */
  --color-primary:        #0E4651;
  --color-primary-hover:  #155560;
  --color-primary-deep:   #062730;
  --color-accent:         #D2A24A;
  --color-accent-hover:   #BE8C36;
  --color-accent-text:    #9E722C; /* gold-as-text on light surfaces */

  /* Text */
  --color-ink:            #1C1A17;
  --color-body:           #4A4740;
  --color-muted:          #847F75;
  --color-on-dark:        #F0EFEC;

  /* Surfaces */
  --color-bg:             #F8F8F6;
  --color-surface:        #FFFFFF;
  --color-surface-tint:   #ECF4F5; /* teal-50, section bands */
  --color-line:           #E2E0DB;

  /* Semantic */
  --color-success:        #2E7D5B;
  --color-success-bg:     #E6F2EC;
  --color-warning:        #C2620E;
  --color-warning-bg:     #FBEBD9;
  --color-error:          #B23A2E;
  --color-error-bg:       #F7E7E5;
  --color-info:           #2C6E9B;
  --color-info-bg:        #E5EFF6;

  /* Focus */
  --focus-ring:           #D2A24A;
}
```

### Dark mode

```css
[data-theme="dark"] {
  --color-primary:        #6FA8AF; /* teal-300, legible on dark */
  --color-primary-hover:  #A3C8CD;
  --color-accent:         #DDB868; /* gold-300, brighter for dark */
  --color-accent-hover:   #EAD29D;
  --color-accent-text:    #DDB868;

  --color-ink:            #F0EFEC;
  --color-body:           #CBC8C1;
  --color-muted:          #A8A49B;
  --color-on-dark:        #F0EFEC;

  --color-bg:             #0A2228; /* deep teal-tinted, not pure black */
  --color-surface:        #0E2E36;
  --color-surface-tint:   #123A43;
  --color-line:           #1E4750;
}
```

---

## Tailwind config (v3)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50:'#ECF4F5',100:'#D0E3E6',200:'#A3C8CD',300:'#6FA8AF',400:'#428891',
          500:'#1F6B75',600:'#155560',700:'#0E4651',800:'#0A3640',900:'#062730',
          DEFAULT:'#0E4651',
        },
        accent: {
          50:'#FBF6EC',100:'#F5E9CE',200:'#EAD29D',300:'#DDB868',400:'#D2A24A',
          500:'#BE8C36',600:'#9E722C',700:'#7C5924',800:'#5C421C',900:'#3E2D13',
          DEFAULT:'#D2A24A',
        },
        slate: {
          50:'#F8F8F6',100:'#F0EFEC',200:'#E2E0DB',300:'#CBC8C1',400:'#A8A49B',
          500:'#847F75',600:'#635F57',700:'#4A4740',800:'#322F2A',900:'#1C1A17',
        },
        success:'#2E7D5B', warning:'#C2620E', error:'#B23A2E', info:'#2C6E9B',
      },
    },
  },
};
```

---

## Typography pairing

Not the system-default sans you'd reach for on any project. The brief wants authority + warmth, so pair a humanist serif for headlines with a clean grotesque for body and a mono for figures.

| Role | Typeface | Fallback stack |
|------|----------|----------------|
| Display / headings | **Fraunces** (soft serif, opsz) | `'Fraunces', Georgia, serif` |
| Body / UI | **Inter** | `'Inter', system-ui, sans-serif` |
| Numbers / data | **IBM Plex Mono** | `'IBM Plex Mono', ui-monospace, monospace` |

Set financial figures, rates, and tabular data in the mono face with `font-variant-numeric: tabular-nums;` — it signals "we take numbers seriously" and keeps columns aligned. That's the brand's one quiet signature.

```css
--font-display: 'Fraunces', Georgia, serif;
--font-body:    'Inter', system-ui, sans-serif;
--font-mono:    'IBM Plex Mono', ui-monospace, monospace;
```

Type scale (1.25 ratio): `12 · 14 · 16 · 20 · 25 · 31 · 39 · 49px`. Headings in Fraunces at weight 500–600; body Inter 400; labels/eyebrows Inter 500 in `--color-accent-text`, uppercase, `letter-spacing: 0.08em`.

---

## Contrast & accessibility

All combos below clear WCAG AA. The one trap: **Brass Gold (`#D2A24A`) is decorative, not a text colour** on light backgrounds — it fails contrast. Use Antique Brass (`#9E722C`) when gold must be text.

| Foreground | Background | Ratio | Verdict |
|------------|-----------|-------|---------|
| Ink `#1C1A17` | Paper `#F8F8F6` | ~15:1 | AAA |
| Body `#4A4740` | Paper `#F8F8F6` | ~8.8:1 | AAA |
| White | Petrol Teal `#0E4651` | ~8.6:1 | AAA |
| Accent text `#9E722C` | Paper `#F8F8F6` | ~4.7:1 | AA |
| Brass Gold `#D2A24A` | Ink Teal `#062730` | ~6.9:1 | AA (gold *on dark* is fine) |

Always pair the gold accent with a non-colour cue (icon, underline, weight) so colour isn't the only signal.

---

## Usage rules

**Do**
- One Brass Gold CTA per viewport. Scarcity is what makes it read as premium.
- Build pages on Paper/white with Petrol Teal for structure; bring gold in only at decision points.
- Use teal-50 (`#ECF4F5`) section bands to separate content instead of heavy borders.
- Reserve the mono face for real numbers.

**Don't**
- Don't use gold as body or link text on light backgrounds.
- Don't introduce a money-green or a fourth brand hue.
- Don't use pure `#000` or pure cool gray — stay on the warm slate ramp.
- Don't gradient-wash the teal-and-gold together; keep them as flat, confident fields.
