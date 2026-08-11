-- ─────────────────────────────────────────────────────────────
--  Migration 002 — cutoffs, branch placements, structured costs
--  Run once in Supabase SQL Editor. Safe to re-run.
-- ─────────────────────────────────────────────────────────────

-- 1) Cutoffs: college × exam × year × round × branch × category × quota × gender
create table if not exists public.cutoffs (
  id            bigint generated always as identity primary key,
  college_id    text not null references public.colleges(id) on delete cascade,
  exam          text not null,                   -- 'JEE Advanced'|'JEE Main'|'BITSAT'|'VITEEE'|...
  year          int  not null,
  round         text not null default 'final',   -- '1'..'6' | 'final'
  branch        text not null,                   -- 'CSE','ECE','EE','ME','CE','CHE'
  category      text not null default 'General', -- 'General'|'EWS'|'OBC-NCL'|'SC'|'ST'
  quota         text not null default 'AI',      -- 'AI' (IIT/all-India) | 'OS' | 'HS' (NIT quotas)
  gender        text not null default 'GN',      -- 'GN' | 'Female'
  closing_rank  int,                             -- rank-based exams (category rank for reserved)
  closing_score numeric,                         -- score-based exams (BITSAT marks)
  unique (college_id, exam, year, round, branch, category, quota, gender)
);
create index if not exists cutoffs_predictor_idx
  on public.cutoffs (exam, year, category, branch, closing_rank);

alter table public.cutoffs enable row level security;
drop policy if exists "public read cutoffs" on public.cutoffs;
create policy "public read cutoffs" on public.cutoffs for select using (true);
drop policy if exists "admin write cutoffs" on public.cutoffs;
create policy "admin write cutoffs" on public.cutoffs for all to authenticated
  using      ( (auth.jwt() ->> 'email') = 'rayanrayanhussain9@gmail.com' )
  with check ( (auth.jwt() ->> 'email') = 'rayanrayanhussain9@gmail.com' );

-- 2) Branch-wise placements: college × branch × year
create table if not exists public.branch_placements (
  id             bigint generated always as identity primary key,
  college_id     text not null references public.colleges(id) on delete cascade,
  branch         text not null,
  year           int  not null,
  median_package numeric,
  avg_package    numeric,
  percent_placed numeric,
  top_recruiters jsonb default '[]'::jsonb,
  unique (college_id, branch, year)
);
alter table public.branch_placements enable row level security;
drop policy if exists "public read branch_placements" on public.branch_placements;
create policy "public read branch_placements" on public.branch_placements for select using (true);
drop policy if exists "admin write branch_placements" on public.branch_placements;
create policy "admin write branch_placements" on public.branch_placements for all to authenticated
  using      ( (auth.jwt() ->> 'email') = 'rayanrayanhussain9@gmail.com' )
  with check ( (auth.jwt() ->> 'email') = 'rayanrayanhussain9@gmail.com' );

-- 3) Structured 4-year cost on colleges (₹ lakhs)
alter table public.colleges add column if not exists costs jsonb default '{}'::jsonb;
