-- ============================================================================
-- GlobalView · Supabase schema
-- Run this once in the Supabase dashboard → SQL Editor → New query → Run.
-- Safe to re-run (idempotent).
-- ============================================================================

-- ---------------------------------------------------------------- programs
create table if not exists public.programs (
  id              text primary key,
  country         text not null,
  country_name    text not null,
  city            text,
  university      text not null,
  university_cn   text not null,
  program         text not null,
  program_zh      text,
  degree          text,
  discipline      text not null,
  duration        text,
  intake          text,
  selectivity     text check (selectivity in ('高竞争','中高竞争','稳健匹配')),
  official_url    text,
  source_note     text,
  tags            jsonb not null default '[]'::jsonb,
  qs_rank         integer,
  university_id   text,
  university_type text,
  region          text,
  faculty         text,
  department      text,
  raw_discipline  text,
  tuition         text,
  deadline_note   text,
  language_requirements text,
  gre_required    text,
  entry_requirements text,
  source_urls     jsonb not null default '[]'::jsonb,
  data_completeness integer,
  last_updated    date,
  stem_designated boolean,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table if exists public.programs drop constraint if exists programs_country_check;
alter table if exists public.programs drop constraint if exists programs_discipline_check;
alter table if exists public.programs add column if not exists program_zh text;
alter table if exists public.programs add column if not exists university_id text;
alter table if exists public.programs add column if not exists university_type text;
alter table if exists public.programs add column if not exists region text;
alter table if exists public.programs add column if not exists faculty text;
alter table if exists public.programs add column if not exists department text;
alter table if exists public.programs add column if not exists raw_discipline text;
alter table if exists public.programs add column if not exists language_requirements text;
alter table if exists public.programs add column if not exists gre_required text;
alter table if exists public.programs add column if not exists entry_requirements text;
alter table if exists public.programs add column if not exists source_urls jsonb not null default '[]'::jsonb;
alter table if exists public.programs add column if not exists data_completeness integer;
alter table if exists public.programs add column if not exists last_updated date;

-- ------------------------------------------------------------------- cases
create table if not exists public.cases (
  id              text primary key,
  applicant_alias text,
  degree_level    text not null default 'master',
  program_id      text not null references public.programs(id) on update cascade,
  country         text not null,
  country_name    text not null,
  university      text not null,
  university_cn   text not null,
  program         text not null,
  discipline      text not null,
  result          text not null check (result in ('admit','conditional','waitlist','reject')),
  season          text not null,
  round           text,
  offer_date      date,
  scholarship     text default '无',
  undergrad_school text,
  undergrad_tier  text not null check (undergrad_tier in ('C9/985','211','双非一本','中外合作','海外本科')),
  major           text not null,
  gpa             numeric(3,2) not null check (gpa >= 0 and gpa <= 4.3),
  gpa_scale       numeric not null default 4,
  gpa_text        text not null,
  ielts           numeric,
  toefl           integer,
  gre             integer,
  gmat            integer,
  work_experience_months integer not null default 0,
  internships     jsonb not null default '[]'::jsonb,
  research        jsonb not null default '[]'::jsonb,
  highlights      jsonb not null default '[]'::jsonb,
  strategy        text not null,
  timeline        jsonb not null default '[]'::jsonb,
  tags            jsonb not null default '[]'::jsonb,
  source_type     text not null default 'partner-verified',
  privacy_level   text not null default 'anonymous' check (privacy_level = 'anonymous'),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table if exists public.cases drop constraint if exists cases_country_check;
alter table if exists public.cases drop constraint if exists cases_discipline_check;

create index if not exists idx_cases_country    on public.cases(country);
create index if not exists idx_cases_discipline on public.cases(discipline);
create index if not exists idx_cases_result     on public.cases(result);
create index if not exists idx_cases_tier       on public.cases(undergrad_tier);
create index if not exists idx_cases_gpa        on public.cases(gpa);
create index if not exists idx_cases_program    on public.cases(program_id);

-- ------------------------------------------------------- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_programs_touch on public.programs;
create trigger trg_programs_touch before update on public.programs
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_cases_touch on public.cases;
create trigger trg_cases_touch before update on public.cases
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------- RLS
-- Anonymized data is public-read. Writes are blocked for anon/auth and only
-- allowed via the service_role key (used by the import / export scripts).
alter table public.programs enable row level security;
alter table public.cases    enable row level security;

drop policy if exists "public read programs" on public.programs;
create policy "public read programs" on public.programs for select using (true);

drop policy if exists "public read cases" on public.cases;
create policy "public read cases" on public.cases for select using (true);
