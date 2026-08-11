-- ─────────────────────────────────────────────────────────────
--  CollegeClash — Supabase schema
--  Run this in your Supabase project: SQL Editor → New query → paste → Run.
--  Then run seed.sql the same way to load the 58 colleges.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.colleges (
  id           text primary key,
  name         text not null,
  city         text,
  type         text,
  accent       text,
  tagline      text,
  image        text,
  thumb        text,
  specialities jsonb default '[]'::jsonb,
  factors      jsonb default '{}'::jsonb,
  created_at   timestamptz default now()
);

-- Lock the table down, then open exactly what we need.
alter table public.colleges enable row level security;

-- 1) Anyone (even logged-out visitors) may READ colleges → powers the public site.
drop policy if exists "public read colleges" on public.colleges;
create policy "public read colleges"
  on public.colleges for select
  using (true);

-- 2) Only the single admin account (matched by email) may add/edit/delete.
drop policy if exists "admin write colleges" on public.colleges;
create policy "admin write colleges"
  on public.colleges for all
  to authenticated
  using      ( (auth.jwt() ->> 'email') = 'rayanrayanhussain9@gmail.com' )
  with check ( (auth.jwt() ->> 'email') = 'rayanrayanhussain9@gmail.com' );
