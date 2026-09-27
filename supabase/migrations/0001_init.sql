-- Football Mafia — MVP schema
-- Derived from docs/technical-architecture.md §4. Room taxonomy locked
-- (docs/decisions.md, 2026-09-14): one global chat room per match.
--
-- Ordering matters: reference tables first, then matches/events, then
-- chat/feed/moderation, which reference profiles + matches.

-- ============================================================
-- identity & reference
-- ============================================================

create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  club_id      bigint references clubs(id),
  country_code text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

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

-- profiles.club_id above forward-references clubs; fix it up now that
-- clubs exists (Postgres doesn't allow a table to reference one defined
-- later in the same file without this two-step).
alter table profiles
  add constraint profiles_club_id_fkey
  foreign key (club_id) references clubs(id);

create table teams (
  id           bigserial primary key,
  club_id      bigint references clubs(id),
  provider_ref text not null unique,
  name         text not null
);

-- ============================================================
-- matches & events (written by the ingestion worker / service role only)
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
-- live rooms & chat
-- ============================================================

-- MVP: exactly one 'global' room per match — see docs/decisions.md.
-- Do not build room-selection UI against this table; it's a 1:1 with matches.
create table chat_rooms (
  id         bigserial primary key,
  match_id   bigint not null references matches(id) on delete cascade,
  type       text not null default 'global',
  created_at timestamptz not null default now(),
  unique (match_id, type)
);

create table messages (
  id         bigserial primary key,
  room_id    bigint not null references chat_rooms(id) on delete cascade,
  user_id    uuid not null references profiles(id),
  body       text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index messages_room_created_idx on messages (room_id, created_at desc);

create table reactions (
  message_id bigint not null references messages(id) on delete cascade,
  user_id    uuid not null references profiles(id),
  emoji      text not null,
  primary key (message_id, user_id, emoji)
);

-- ============================================================
-- community feed
-- ============================================================

create table posts (
  id         bigserial primary key,
  author_id  uuid not null references profiles(id),
  club_id    bigint not null references clubs(id),
  body       text,
  image_url  text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index posts_club_created_idx on posts (club_id, created_at desc);

create table comments (
  id         bigserial primary key,
  post_id    bigint not null references posts(id) on delete cascade,
  author_id  uuid not null references profiles(id),
  body       text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table likes (
  post_id bigint not null references posts(id) on delete cascade,
  user_id uuid not null references profiles(id),
  primary key (post_id, user_id)
);

create table follows (
  follower_id uuid not null references profiles(id),
  followee_id uuid not null references profiles(id),
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
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
-- moderation
-- ============================================================

create table reports (
  id          bigserial primary key,
  reporter_id uuid not null references profiles(id),
  target_type text not null check (target_type in ('message', 'post', 'comment')),
  target_id   bigint not null,
  reason      text,
  status      text not null default 'open' check (status in ('open', 'reviewed', 'actioned')),
  created_at  timestamptz not null default now()
);

create table mutes (
  muter_id uuid not null references profiles(id),
  muted_id uuid not null references profiles(id),
  primary key (muter_id, muted_id),
  check (muter_id <> muted_id)
);

create table blocked_words (
  word text primary key
);

-- ============================================================
-- Phase 2 (forward-compat only — not built now)
-- ============================================================

create table predictions (
  id         bigserial primary key,
  user_id    uuid not null references profiles(id),
  match_id   bigint not null references matches(id),
  home_pred  int not null,
  away_pred  int not null,
  points     int,
  created_at timestamptz not null default now(),
  unique (user_id, match_id)
);

-- ============================================================
-- RLS — default-deny everywhere; explicit policies grant access.
-- See docs/technical-architecture.md §4/§9 for the intent this encodes.
-- ============================================================

alter table profiles enable row level security;
alter table competitions enable row level security;
alter table clubs enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table match_events enable row level security;
alter table chat_rooms enable row level security;
alter table messages enable row level security;
alter table reactions enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table likes enable row level security;
alter table follows enable row level security;
alter table match_logs enable row level security;
alter table reports enable row level security;
alter table mutes enable row level security;
alter table blocked_words enable row level security;
alter table predictions enable row level security;

-- ---- reference tables: readable by any authenticated client, ----
-- ---- writable only by the service role (the ingestion worker). ----
create policy "competitions readable" on competitions for select using (true);
create policy "clubs readable" on clubs for select using (true);
create policy "teams readable" on teams for select using (true);
create policy "matches readable" on matches for select using (true);
create policy "match_events readable" on match_events for select using (true);
create policy "chat_rooms readable" on chat_rooms for select using (true);
create policy "blocked_words readable" on blocked_words for select using (true);
-- No insert/update/delete policies on these for the `authenticated` role:
-- default-deny means only the service role (which bypasses RLS) can write.

-- ---- profiles: public read, owner write ----
create policy "profiles readable" on profiles for select using (true);
create policy "profiles insert own" on profiles for insert with check (id = auth.uid());
create policy "profiles update own" on profiles for update using (id = auth.uid());

-- ---- messages: room members read (MVP: any authenticated user, since ----
-- ---- rooms aren't access-gated in v1), owner writes, excl. soft-deleted ----
create policy "messages readable" on messages for select
  using (deleted_at is null);
create policy "messages insert own" on messages for insert
  with check (user_id = auth.uid());
create policy "messages soft-delete own" on messages for update
  using (user_id = auth.uid());

create policy "reactions readable" on reactions for select using (true);
create policy "reactions manage own" on reactions for insert with check (user_id = auth.uid());
create policy "reactions delete own" on reactions for delete using (user_id = auth.uid());

-- ---- community feed ----
create policy "posts readable" on posts for select using (deleted_at is null);
create policy "posts insert own" on posts for insert with check (author_id = auth.uid());
create policy "posts soft-delete own" on posts for update using (author_id = auth.uid());

create policy "comments readable" on comments for select using (deleted_at is null);
create policy "comments insert own" on comments for insert with check (author_id = auth.uid());
create policy "comments soft-delete own" on comments for update using (author_id = auth.uid());

create policy "likes readable" on likes for select using (true);
create policy "likes manage own" on likes for insert with check (user_id = auth.uid());
create policy "likes delete own" on likes for delete using (user_id = auth.uid());

create policy "follows readable" on follows for select using (true);
create policy "follows manage own" on follows for insert with check (follower_id = auth.uid());
create policy "follows delete own" on follows for delete using (follower_id = auth.uid());

-- ---- match log: private to the owner ----
create policy "match_logs owner read" on match_logs for select using (user_id = auth.uid());
create policy "match_logs owner write" on match_logs for insert with check (user_id = auth.uid());
create policy "match_logs owner update" on match_logs for update using (user_id = auth.uid());

-- ---- moderation: users see/manage only their own actions ----
create policy "reports owner read" on reports for select using (reporter_id = auth.uid());
create policy "reports owner insert" on reports for insert with check (reporter_id = auth.uid());

create policy "mutes owner read" on mutes for select using (muter_id = auth.uid());
create policy "mutes owner insert" on mutes for insert with check (muter_id = auth.uid());
create policy "mutes owner delete" on mutes for delete using (muter_id = auth.uid());

-- ---- predictions (Phase 2 forward-compat; not exposed to the app yet) ----
create policy "predictions owner read" on predictions for select using (user_id = auth.uid());
create policy "predictions owner insert" on predictions for insert
  with check (user_id = auth.uid() and now() < (select kickoff_at from matches where id = match_id));
