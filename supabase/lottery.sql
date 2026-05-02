-- Yayeon 2026 lottery storage and atomic draw function

create table if not exists public.yayeon_lottery_attempts (
  id bigserial primary key,
  event_date date not null,
  visitor_hash text not null,
  result text not null check (result in ('win', 'lose')),
  created_at timestamptz not null default now(),
  unique (event_date, visitor_hash)
);

create index if not exists yayeon_lottery_attempts_event_result_idx
  on public.yayeon_lottery_attempts (event_date, result);

alter table public.yayeon_lottery_attempts enable row level security;

create or replace function public.draw_yayeon_lottery(
  p_event_date date,
  p_visitor_hash text,
  p_max_winners integer default 2
)
returns table(result text, code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_result text;
  winner_count integer;
begin
  perform pg_advisory_xact_lock(hashtext('yayeon_lottery_' || p_event_date::text));

  select a.result into existing_result
  from public.yayeon_lottery_attempts a
  where a.event_date = p_event_date
    and a.visitor_hash = p_visitor_hash;

  if existing_result is not null then
    result := existing_result;
    code := 'ALREADY_PLAYED';
    return next;
    return;
  end if;

  select count(*) into winner_count
  from public.yayeon_lottery_attempts a
  where a.event_date = p_event_date
    and a.result = 'win';

  if winner_count < p_max_winners then
    result := 'win';
  else
    result := 'lose';
  end if;

  insert into public.yayeon_lottery_attempts (event_date, visitor_hash, result)
  values (p_event_date, p_visitor_hash, result);

  code := 'DRAW_COMPLETE';
  return next;
end;
$$;

revoke all on function public.draw_yayeon_lottery(date, text, integer) from public;
grant execute on function public.draw_yayeon_lottery(date, text, integer) to service_role;
