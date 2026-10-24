-- League standings cache, populated from API-Football's /standings endpoint
-- (1 call/day per competition per their recommended cadence — see
-- apps/web/lib/sync-fixtures.ts). Read by the Feed page's standings snippet.

create table standings (
  id             bigserial primary key,
  competition_id bigint not null references competitions(id),
  club_id        bigint not null references clubs(id),
  rank           int not null,
  points         int not null,
  played         int not null,
  won            int not null,
  drawn          int not null,
  lost           int not null,
  goal_diff      int not null,
  updated_at     timestamptz not null default now(),
  unique (competition_id, club_id)
);
create index standings_competition_rank_idx on standings (competition_id, rank);

alter table standings enable row level security;
create policy "standings readable" on standings for select using (true);
