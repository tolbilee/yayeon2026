-- Quiz tables for mobile_quiz.html and royal_filial_exam.html (Supabase)

create extension if not exists pgcrypto;

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_type text not null default 'ko' check (quiz_type in ('ko','en')),
  display_order integer not null default 0,
  question text not null,
  image text,
  options jsonb not null,
  correct integer not null,
  explanation text,
  explanation_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quiz_questions
  add column if not exists quiz_type text not null default 'ko';

alter table public.quiz_questions
  drop constraint if exists quiz_questions_quiz_type_check;

alter table public.quiz_questions
  add constraint quiz_questions_quiz_type_check
  check (quiz_type in ('ko','en'));

create table if not exists public.quiz_users (
  id text primary key,
  nickname text not null unique,
  score integer not null,
  total_questions integer not null,
  story text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists quiz_users_score_idx on public.quiz_users (score desc, completed_at desc);
create index if not exists quiz_questions_order_idx on public.quiz_questions (display_order asc);
create index if not exists quiz_questions_type_order_idx on public.quiz_questions (quiz_type, display_order asc);

alter table public.quiz_questions enable row level security;
alter table public.quiz_users enable row level security;

-- Public event mode (no auth): allow read and write from anon.
-- If you need tighter control later, replace these policies.
drop policy if exists quiz_questions_select_all on public.quiz_questions;
create policy quiz_questions_select_all
on public.quiz_questions
for select
to anon
using (true);

drop policy if exists quiz_questions_insert_all on public.quiz_questions;
create policy quiz_questions_insert_all
on public.quiz_questions
for insert
to anon
with check (true);

drop policy if exists quiz_questions_update_all on public.quiz_questions;
create policy quiz_questions_update_all
on public.quiz_questions
for update
to anon
using (true)
with check (true);

drop policy if exists quiz_questions_delete_all on public.quiz_questions;
create policy quiz_questions_delete_all
on public.quiz_questions
for delete
to anon
using (true);

drop policy if exists quiz_users_select_all on public.quiz_users;
create policy quiz_users_select_all
on public.quiz_users
for select
to anon
using (true);

drop policy if exists quiz_users_insert_all on public.quiz_users;
create policy quiz_users_insert_all
on public.quiz_users
for insert
to anon
with check (true);

drop policy if exists quiz_users_update_all on public.quiz_users;
create policy quiz_users_update_all
on public.quiz_users
for update
to anon
using (true)
with check (true);

drop policy if exists quiz_users_delete_all on public.quiz_users;
create policy quiz_users_delete_all
on public.quiz_users
for delete
to anon
using (true);
