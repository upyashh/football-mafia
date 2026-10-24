-- Football Mafia — identity + match-data cache schema
-- Scope: real auth (profiles) + a durable cache for data fetched from the
-- football data provider (competitions/clubs/teams/matches/match_events),
-- plus the match log. Chat, Stands, predictions, moderation and the
-- community feed stay on their current storage (Redis / not yet built) and
-- are deliberately NOT included here — see docs/decisions.md and the
-- "real identity + DB-backed match cache" plan for why this is scoped down
-- from the original full-MVP schema.
--
-- Ordering matters: reference tables first, then matches/events, then
-- match_logs, which references both profiles and matches.

-- ============================================================
-- identity & reference
-- ============================================================

create table competitions (
  id            bigserial primary key,
  provider_ref  text not null,
  name          text not null,
  country_code  text,
  unique (provider_ref)
);

create table clubs (
  id              bigserial primary key,
  competition_id  bigint references competitions(id),
  name            text not null,
  short_name      text,
  primary_color   text,
  secondary_color text,
  provider_ref    text,
  unique (provider_ref)
);

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  -- Mock-data club fixture id (e.g. "club-ars"), NOT a FK to clubs.id below.
  -- The club picker UI still runs entirely off packages/mock-data's static
  -- clubs fixture for this pass (see the plan's scope note) — the clubs
  -- table here only backs the match-data cache's FKs.
  club_id      text,
  country_code text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

create table teams (
  id           bigserial primary key,
  club_id      bigint references clubs(id),
  provider_ref text not null unique,
  name         text not null
);

-- ============================================================
-- matches & events — the data-access cache layer's write target.
-- Written only by the service role (apps/web/lib/match-data.ts), never
-- directly by clients: see the "matches/match_events writable" policies
-- below (there are none for the authenticated role — default-deny).
-- ============================================================

create table matches (
  id             bigserial primary key,
  provider_ref   text not null unique,
  competition_id bigint references competitions(id),
  home_team_id   bigint references teams(id),
  away_team_id   bigint references teams(id),
  kickoff_at     timestamptz not null,
  status         text not null check (status in ('SCHEDULED', 'LIVE', 'PAUSED', 'FINISHED')),
  minute         int,
  home_score     int,
  away_score     int,
  last_polled_at timestamptz,
  updated_at     timestamptz not null default now()
);
create index matches_status_kickoff_idx on matches (status, kickoff_at);

create table match_events (
  id                 bigserial primary key,
  match_id           bigint not null references matches(id) on delete cascade,
  type               text not null check (type in ('KICKOFF', 'GOAL', 'CARD_YELLOW', 'CARD_RED', 'SUB', 'HALFTIME', 'FULLTIME')),
  minute             int,
  team_id            bigint references teams(id),
  player_name        text,
  payload            jsonb not null default '{}',
  provider_event_key text not null,
  created_at         timestamptz not null default now(),
  unique (match_id, provider_event_key)
);

-- ============================================================
-- match log (single-player value)
-- ============================================================

create table match_logs (
  id         bigserial primary key,
  user_id    uuid not null references profiles(id),
  match_id   bigint not null references matches(id),
  watched    boolean not null default true,
  rating     smallint check (rating between 0 and 10),
  note       text,
  created_at timestamptz not null default now(),
  unique (user_id, match_id)
);

-- ============================================================
-- RLS — default-deny everywhere; explicit policies grant access.
-- ============================================================

alter table profiles enable row level security;
alter table competitions enable row level security;
alter table clubs enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table match_events enable row level security;
alter table match_logs enable row level security;

-- ---- reference + match data: readable by any client, writable only by ----
-- ---- the service role (match-data.ts's cache writer bypasses RLS). ----
create policy "competitions readable" on competitions for select using (true);
create policy "clubs readable" on clubs for select using (true);
create policy "teams readable" on teams for select using (true);
create policy "matches readable" on matches for select using (true);
create policy "match_events readable" on match_events for select using (true);

-- ---- profiles: public read, owner write ----
create policy "profiles readable" on profiles for select using (true);
create policy "profiles insert own" on profiles for insert with check (id = auth.uid());
create policy "profiles update own" on profiles for update using (id = auth.uid());

-- ---- match log: private to the owner ----
create policy "match_logs owner read" on match_logs for select using (user_id = auth.uid());
create policy "match_logs owner write" on match_logs for insert with check (user_id = auth.uid());
create policy "match_logs owner update" on match_logs for update using (user_id = auth.uid());

-- ============================================================
-- seed data — static reference fixtures, mirrors
-- packages/mock-data/src/fixtures/{competitions,clubs,teams}.ts.
-- provider_ref values match the mock-openfoot scenario ids/team ids in
-- packages/mock-data/src/provider/scenarios.ts so the cache layer's upserts
-- land on these same rows once real match data starts flowing through it.
-- ============================================================

insert into competitions (provider_ref, name, country_code) values
  ('comp-pl', 'Premier League', 'GB'),
  ('comp-laliga', 'La Liga', 'ES'),
  ('comp-ucl', 'Champions League', 'EU');

insert into clubs (competition_id, name, short_name, primary_color, secondary_color, provider_ref) values
  ((select id from competitions where provider_ref = 'comp-pl'), 'Arsenal', 'ARS', '#EF0107', '#FFFFFF', 'club-ars'),
  ((select id from competitions where provider_ref = 'comp-pl'), 'Manchester City', 'MCI', '#6CABDD', '#1C2C5B', 'club-mci'),
  ((select id from competitions where provider_ref = 'comp-pl'), 'Liverpool', 'LIV', '#C8102E', '#F6EB61', 'club-liv'),
  ((select id from competitions where provider_ref = 'comp-pl'), 'Manchester United', 'MUN', '#DA291C', '#FBE122', 'club-mun'),
  ((select id from competitions where provider_ref = 'comp-laliga'), 'Real Madrid', 'RMA', '#FEBE10', '#00529F', 'club-rma'),
  ((select id from competitions where provider_ref = 'comp-laliga'), 'Barcelona', 'FCB', '#A50044', '#004D98', 'club-fcb'),
  ((select id from competitions where provider_ref = 'comp-laliga'), 'Atletico Madrid', 'ATM', '#CB3524', '#FFFFFF', 'club-atm');

-- Provider-shape team refs (team_<name>_<country>) used by the mock-openfoot
-- scenarios — distinct from the internal fixtures' team-<shortname> ids.
insert into teams (club_id, provider_ref, name) values
  ((select id from clubs where provider_ref = 'club-ars'), 'team_arsenal_gb', 'Arsenal'),
  ((select id from clubs where provider_ref = 'club-mci'), 'team_manchester_city_gb', 'Manchester City'),
  ((select id from clubs where provider_ref = 'club-liv'), 'team_liverpool_gb', 'Liverpool'),
  ((select id from clubs where provider_ref = 'club-mun'), 'team_manchester_united_gb', 'Manchester United'),
  ((select id from clubs where provider_ref = 'club-rma'), 'team_real_madrid_es', 'Real Madrid'),
  ((select id from clubs where provider_ref = 'club-fcb'), 'team_barcelona_es', 'Barcelona'),
  ((select id from clubs where provider_ref = 'club-atm'), 'team_atletico_madrid_es', 'Atletico Madrid');
