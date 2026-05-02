-- Yayeon 2026 letter QR event storage and scan functions

create extension if not exists pgcrypto;

create table if not exists public.yayeon_letter_slots (
  slot_id text primary key,
  public_token text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (slot_id in ('A', 'B', 'C'))
);

create table if not exists public.yayeon_letter_sessions (
  session_id uuid primary key,
  display_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.yayeon_letter_scans (
  session_id uuid not null references public.yayeon_letter_sessions(session_id) on delete cascade,
  slot_id text not null references public.yayeon_letter_slots(slot_id),
  created_at timestamptz not null default now(),
  primary key (session_id, slot_id)
);

create index if not exists yayeon_letter_scans_slot_idx
  on public.yayeon_letter_scans (slot_id);

alter table public.yayeon_letter_slots enable row level security;
alter table public.yayeon_letter_sessions enable row level security;
alter table public.yayeon_letter_scans enable row level security;

insert into public.yayeon_letter_slots (slot_id, public_token, active)
values
  ('A', '8cc76309cbde4c41993a9c47e26e018a', true),
  ('B', '941c6a14230bb8f20327db269cbc2a24', true),
  ('C', '93c55051a68cf14fad266419ec7ed208', true)
on conflict (slot_id) do update
set public_token = excluded.public_token,
    active = excluded.active;

create or replace function public.scan_yayeon_letter(
  p_public_token text,
  p_session_id uuid,
  p_display_code text
)
returns table(ok boolean, code text, found_count integer, max_count integer, display_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot_id text;
  v_display_code text;
begin
  select s.slot_id into v_slot_id
  from public.yayeon_letter_slots s
  where s.public_token = p_public_token
    and s.active = true;

  if v_slot_id is null then
    ok := false;
    code := 'INVALID_TOKEN';
    found_count := 0;
    max_count := 3;
    display_code := null;
    return next;
    return;
  end if;

  insert into public.yayeon_letter_sessions (session_id, display_code, updated_at)
  values (p_session_id, p_display_code, now())
  on conflict (session_id) do update
  set updated_at = now()
  returning yayeon_letter_sessions.display_code into v_display_code;

  insert into public.yayeon_letter_scans (session_id, slot_id)
  values (p_session_id, v_slot_id)
  on conflict (session_id, slot_id) do nothing;

  select count(*)::integer into found_count
  from public.yayeon_letter_scans ls
  where ls.session_id = p_session_id;

  ok := true;
  code := 'SCAN_RECORDED';
  max_count := 3;
  display_code := v_display_code;
  return next;
end;
$$;

create or replace function public.get_yayeon_letter_progress(
  p_session_id uuid
)
returns table(ok boolean, code text, found_count integer, max_count integer, display_code text)
language plpgsql
security definer
set search_path = public
as $$
begin
  select s.display_code into display_code
  from public.yayeon_letter_sessions s
  where s.session_id = p_session_id;

  if display_code is null then
    ok := true;
    code := 'NO_SESSION';
    found_count := 0;
    max_count := 3;
    return next;
    return;
  end if;

  select count(*)::integer into found_count
  from public.yayeon_letter_scans ls
  where ls.session_id = p_session_id;

  ok := true;
  code := 'PROGRESS_LOADED';
  max_count := 3;
  return next;
end;
$$;

revoke all on function public.scan_yayeon_letter(text, uuid, text) from public;
revoke all on function public.get_yayeon_letter_progress(uuid) from public;
grant execute on function public.scan_yayeon_letter(text, uuid, text) to service_role;
grant execute on function public.get_yayeon_letter_progress(uuid) to service_role;
