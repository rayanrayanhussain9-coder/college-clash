# CollegeClash

Compare Indian engineering colleges head-to-head across 15 factors with a
minimal warm-white and charcoal UI. Public site is read-only; a hidden single-admin
panel (footer → "CollegeClash" click → login) edits data in Supabase.

**Live:** https://collegeclash.netlify.app · **Supabase:** https://clribazrtqivckjkinqz.supabase.co

## Tech stack

- **Vite 8 + React 19** (plain JSX, no TypeScript, no router — yet)
- **framer-motion** (animations) · **lucide-react** (icons)
- **@supabase/supabase-js** — Postgres DB + auth (single admin, no signups)
- Plain CSS in `src/index.css` (design tokens as CSS vars, flat class names —
  no CSS-in-JS, no Tailwind)
- Deployed as a static site on Netlify via **manual drag-and-drop of `dist/`**
  (no git-based CI). Supabase is host-independent.

## Folder structure

```
college-clash/
  index.html                  fonts (Space Grotesk + Inter), meta
  src/
    main.jsx                  entry → App
    App.jsx                   composition + selection/admin state (max 4 picks)
    index.css                 ALL styles: tokens, hero, table, admin, modals
    data/colleges.js          FACTORS definition + 58-college fallback/seed data
    lib/
      supabase.js             client, URL + publishable key, ADMIN_EMAIL, isConfigured
      useColleges.js          fetch from Supabase → fallback to bundled data
      useAuth.js              session tracking, isAdmin (email match)
      scoring.js              normalisation, winner math, formatValue, cell colours
    components/
      BackgroundCarousel.jsx  fixed hero carousel (5s crossfade, MARQUEE_IDS)
      Hero.jsx / ScrollStory.jsx / Specialities.jsx / Verdict.jsx
      CompareBuilder.jsx      chips + "+" cards
      CollegePicker.jsx       searchable modal
      ComparisonTable.jsx     15-factor table, green/red, stars, info rows
      CollegeImage.jsx        photo w/ gradient fallback; `small` → thumb
      AdminLogin.jsx          footer-triggered login modal
      AdminPanel.jsx          full-screen CRUD for colleges
  supabase/
    schema.sql                colleges table + RLS (public read / admin write)
    seed.sql                  upsert of all 58 colleges (regenerate after data edits)
  public/                     favicon, icons (copied verbatim into dist/)
```

Stale scaffold leftovers safe to delete: `src/App.css`, `src/assets/*`.

## Where college data lives

**Source of truth: Supabase table `public.colleges`.** The bundled
`src/data/colleges.js` is (a) the offline/unconfigured fallback and (b) the
generator input for `supabase/seed.sql`.

**Data-change workflow (important):** edit `colleges.js` → regenerate
`seed.sql` (node script: eval COLLEGES, emit upsert) → user pastes seed.sql in
Supabase SQL Editor → rebuild + drag `dist/` to Netlify. Changing only
colleges.js does NOT change the live site's data.

> ⚠️ Pending as of 2026-06-27: the corrected seed (reputation as 1–3 stars,
> 2024 placement rates) exists locally but has NOT been run in Supabase — live
> DB still holds old /100 reputation values. Re-run seed.sql first.

### College row shape

```js
{
  id: "iit-bombay",            // slug PK; never contains "-vs-"
  name, city, type, accent,    // accent = hex for chip/bar tints
  tagline, image, thumb,       // direct upload.wikimedia.org URLs (~1100px / ~320px)
  specialities: ["...", ...],  // jsonb array
  factors: {                   // jsonb — all 15 keys required
    ranking,                   // number; 101/151/201 = NIRF band starts, 999 = not ranked
    reputation, recruiters, infrastructure,   // stars 1–3
    avgPackage, medianPackage, highestPackage,// LPA; display flips to Cr ≥ 100
    placementRate,             // %
    fees, feesRange,           // midpoint number (scoring) + display string "₹8–10 L"
    facultyRatio, research, campusAcres,      // numbers
    accreditation, exam, location,            // text (info-only, not scored)
  },
}
```

`FACTORS` (top of colleges.js) drives everything: each factor has
`type: "number" | "money" | "stars" | "text"` and `higherIsBetter`. Text
factors are informational — excluded from scoring/colours. Winner = equal-
weighted mean of normalised scored factors (12 today), scaled to /10.

## Coding conventions

- Functional components + hooks; hooks live in `src/lib`, UI in `src/components`.
- Styling: add classes to `index.css` using the existing tokens
  (`--bg --ink --muted --neon1 --neon2 --good --bad --glass --glass-bd`).
  Use warm white surfaces, charcoal text, restrained green controls and subtle
  green/red comparison outcomes. Avoid neon text, glows and animated gradients.
- Images: always two sizes (`image` ~1100px, `thumb` ~320px) as **direct**
  wikimedia CDN URLs. Never `Special:FilePath?width=` (double-redirect, no
  cache — caused a real perf bug). Missing image = "" → gradient fallback.
- No `will-change` on many layers; no `backdrop-filter` over the fixed
  carousel (scroll-perf bugs previously fixed — don't reintroduce).
- Data accuracy bar: user requires ≥80% accuracy; rankings/NAAC/exam/campus
  are factual, packages/placement anchored to published reports.
- Supabase: publishable key in code is fine; NEVER the secret key or
  passwords. RLS pattern: public `select`, writes gated to
  `auth.jwt()->>'email' = ADMIN_EMAIL`. No public signup.

---

# Feature roadmap (agreed 2026-06-27)

Six features, in order: cutoffs → branch placements → cost/ROI → weight
sliders → rank predictor → shareable URLs.

**Status:** Phases 0–2 DONE (2026-06-28): `_redirects` added, migration 002 run,
`cutoffs` live with 1,442 rows (General = sourced JoSAA 2024 R5; EWS/OBC-NCL/SC/ST =
anchored top-college actuals + ratio-derived estimates; BITS/VIT/IIIT-H have no
reservations by design). Cutoffs UI shipped in comparison view. Admin CRUD tabs
for cutoffs still pending (fold into Phase 3).

Decisions taken: cutoffs = **2024, ALL JoSAA rounds**, top-6 branches
(CSE, ECE, EE, ME, CE, CHE); ROI = **payback time** (total cost ÷ median,
lower is better); routing = **react-router real paths** + Netlify redirects.

## Extended schema (design once, no rework)

New migration `supabase/migrations/002_features.sql` — two new tables plus
one column; `colleges` itself barely changes:

```sql
-- 1) Cutoffs: college × exam × year × round × branch × category × gender
create table if not exists public.cutoffs (
  id            bigint generated always as identity primary key,
  college_id    text not null references public.colleges(id) on delete cascade,
  exam          text not null,                  -- 'JEE Advanced'|'JEE Main'|'BITSAT'|'VITEEE'|'EAMCET'|...
  year          int  not null,
  round         text not null default 'final',  -- '1'..'6' or 'final'
  branch        text not null,                  -- 'CSE','ECE','EE','ME','CE','CHE' (canonical codes)
  category      text not null default 'General',-- 'General'|'EWS'|'OBC-NCL'|'SC'|'ST'
  gender        text not null default 'GN',     -- 'GN' | 'Female'
  closing_rank  int,                            -- rank-based exams (JoSAA)
  closing_score numeric,                        -- score-based exams (BITSAT marks, VITEEE rank optional)
  unique (college_id, exam, year, round, branch, category, gender)
);
create index if not exists cutoffs_predictor_idx
  on public.cutoffs (exam, year, category, branch, closing_rank);

-- 2) Branch-wise placements: college × branch × year
create table if not exists public.branch_placements (
  id             bigint generated always as identity primary key,
  college_id     text not null references public.colleges(id) on delete cascade,
  branch         text not null,
  year           int  not null,
  median_package numeric,            -- LPA
  avg_package    numeric,            -- LPA
  percent_placed numeric,            -- %
  top_recruiters jsonb default '[]'::jsonb,   -- ["Google","TCS",...]
  unique (college_id, branch, year)
);

-- 3) Structured 4-year cost on the college itself (jsonb, all ₹ lakhs)
alter table public.colleges add column if not exists costs jsonb default '{}'::jsonb;
-- shape: { "tuition": 8.6, "hostel": 1.6, "mess": 2.4, "other": 0.5,
--          "total": 13.1, "year": 2024, "notes": "General category" }

-- RLS: same pattern as colleges (public read, admin write) on both new tables.
```

Why this covers everything with no rework:
- **Cutoffs feature + rank predictor** share `cutoffs`. Predictor =
  `exam+category+year=max, take each (college,branch)'s LAST round, keep rows
  with closing_rank ≥ user rank`. The round column (all-rounds decision) also
  enables round-drift display. `closing_score` future-proofs score-based exams
  (BITSAT); `exam` is free text so EAMCET/state exams slot in when non-JoSAA
  colleges are added. `gender` defaults 'GN'; female-pool rows can be added
  without migration.
- **Branch placements** is its own table → query "CSE at A vs CSE at B"
  across colleges cheaply; college-level factors stay untouched.
- **Cost/ROI**: `costs.total` feeds a *derived* ROI (payback = total ÷
  medianPackage) computed in scoring.js — never stored, so it can't go stale.
- **Weight sliders**: pure client state (no schema); weights encoded in the
  share URL (`?w=`) + localStorage.
- **Share URLs**: ids are already URL-safe slugs and can never contain
  "-vs-", so `/iit-bombay-vs-nit-trichy` parses by splitting on `-vs-`.

## Implementation plan

**Phase 0 — Housekeeping (do first)**
1. Re-run the pending corrected `seed.sql` in Supabase (live DB is stale).
2. Delete `src/App.css`, `src/assets/*` scaffold leftovers.
3. Add `public/_redirects` → `/* /index.html 200` (harmless now, required for
   Phase 6; Vite copies public/ into dist so drag-deploy keeps working).

**Phase 1 — Schema + admin plumbing**
1. Write + run `migrations/002_features.sql` (tables, indexes, RLS).
2. Extend seed generator to also emit cutoffs/branch/costs seeds.
3. Add "Cutoffs" and "Branch placements" tabs to AdminPanel (CRUD rows,
   filtered by the college being edited); costs fields on the college form.

**Phase 2 — Cutoffs (feature 1)**
1. Source JoSAA 2024 all-rounds closing ranks for the 6 branches ×
   5 categories for IITs/NITs (+ BITSAT/VITEEE score cutoffs for BITS/VIT,
   DTU via JAC Delhi, IIIT-H via JEE Main). Seed `cutoffs`.
2. `useCutoffs(collegeIds)` hook; "Admission cutoffs" section in the
   comparison view: category + branch selectors, final-round closing ranks
   side-by-side per college (with round drift shown on expand).

**Phase 3 — Branch-wise placements (feature 2)**
1. Source median/%placed/top recruiters per branch (placement reports/NIRF
   disclosures), seed `branch_placements`.
2. Branch selector above the comparison table → swaps the three package rows
   + placement rate to the chosen branch's numbers (college-level = default
   "Overall" option). Top recruiters chips in Specialities cards.

**Phase 4 — Cost + ROI (feature 3)**
1. Research + seed `costs` for all 58 (tuition/hostel/mess, General cat).
2. scoring.js: two new derived rows — "Total 4-yr cost" (money, lower wins,
   shows breakdown on hover) and "ROI · payback" (`costs.total ÷
   medianPackage`, formatted "≈ 0.6 yrs", lower wins). Derived factors are
   computed at compare time, never stored.

**Phase 5 — Weight sliders (feature 4)**
1. `buildComparison(selected, weights)` — weights object keyed by factor,
   default 1; normalised weighted mean replaces the equal mean.
2. "Adjust priorities" panel: one slider (0–3) per scored factor + presets
   ("Placements first", "Budget", "Balanced"); winner/ranking re-animate
   live. Persist to localStorage + `?w=` query param.

**Phase 6 — Rank predictor (feature 5)**
1. Predictor form (exam, rank, category, optional home-state note): query
   cutoffs (last round of 2024) → eligible (college, branch) list sorted by
   closing-rank margin, each row linking into a comparison.
2. Ships as a section/modal first; gets its own `/predict` URL in Phase 7.

**Phase 7 — Shareable URLs (feature 6)**
1. Add react-router-dom: `/` (home), `/predict`, `/:combo` where combo
   matches `a-vs-b(-vs-c(-vs-d))` → pre-selects those colleges and scrolls
   to the table; unknown slug → home.
2. Selection changes update the URL (replaceState); "Share" button copies
   link incl. `?w=` weights. Netlify `_redirects` (Phase 0) makes deep
   links resolve.

Each phase ends: build → verify in preview → regenerate/run seeds if data
changed → drag `dist/` to Netlify.
