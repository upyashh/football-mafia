import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { Club, Competition, Match } from "@football-mafia/mock-data";

/**
 * Server-side fixture list for the top-5-league real data (API-Football v3).
 * `getFixtures()`/`getRecentResultsForClub()`/`getStandings()` are pure DB
 * reads — provider sync happens on a schedule (apps/web/lib/sync-fixtures.ts,
 * run by the Vercel Cron route + the one-off backfill script), never inside
 * a request path, so page loads never wait on the provider or burn quota.
 */

export type FixtureRecord = {
  match: Match;
  competition: Competition;
  homeClub: Club;
  awayClub: Club;
};

type TeamRow = {
  id: number;
  provider_ref: string;
  club_id: number;
  clubs: ClubRow;
};

type ClubRow = {
  id: number;
  provider_ref: string;
  competition_id: number;
  name: string;
  short_name: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

type CompetitionRow = {
  id: number;
  provider_ref: string;
  name: string;
  country_code: string | null;
};

function clubFromRow(row: ClubRow, competitionRef: string): Club {
  return {
    id: row.provider_ref,
    competitionId: competitionRef,
    name: row.name,
    shortName: row.short_name ?? row.name.slice(0, 3).toUpperCase(),
    primaryColor: row.primary_color ?? "#444444",
    secondaryColor: row.secondary_color ?? "#FFFFFF",
  };
}

function competitionFromRow(row: CompetitionRow): Competition {
  return {
    id: row.provider_ref,
    name: row.name,
    countryCode: row.country_code ?? "",
  };
}

const MATCH_SELECT =
  "id, provider_ref, competition_id, kickoff_at, status, minute, home_score, away_score, home_team:teams!matches_home_team_id_fkey(id, provider_ref, club_id, clubs(*)), away_team:teams!matches_away_team_id_fkey(id, provider_ref, club_id, clubs(*)), competitions(*)";

type MatchRow = {
  id: number;
  provider_ref: string;
  competition_id: number;
  kickoff_at: string;
  status: Match["status"];
  minute: number | null;
  home_score: number | null;
  away_score: number | null;
  home_team: TeamRow | null;
  away_team: TeamRow | null;
  competitions: CompetitionRow | null;
};

function matchRecordFromRow(row: MatchRow): FixtureRecord | null {
  if (!row.home_team || !row.away_team || !row.competitions) return null;
  const competition = competitionFromRow(row.competitions);
  return {
    match: {
      id: row.provider_ref,
      competitionId: competition.id,
      homeTeamId: `team-db-${row.home_team.id}`,
      awayTeamId: `team-db-${row.away_team.id}`,
      kickoffAt: row.kickoff_at,
      status: row.status,
      minute: row.minute ?? undefined,
      homeScore: row.home_score ?? 0,
      awayScore: row.away_score ?? 0,
    },
    competition,
    homeClub: clubFromRow(row.home_team.clubs, competition.id),
    awayClub: clubFromRow(row.away_team.clubs, competition.id),
  };
}

/** A single real fixture by the `matches` table's numeric row id (what `match_logs.match_id` points at). */
export async function getFixtureByRowId(id: number): Promise<FixtureRecord | null> {
  const supabase = createSupabaseServiceClient();

  const { data: row } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .eq("id", id)
    .maybeSingle<MatchRow>();

  if (!row) return null;
  return matchRecordFromRow(row);
}

/** A single real fixture by its provider match ref, synced on-demand via match-data.ts's cache. */
export async function getFixtureByProviderRef(providerRef: string): Promise<FixtureRecord | null> {
  const { getCachedMatch } = await import("@/lib/match-data");
  const supabase = createSupabaseServiceClient();

  await getCachedMatch(providerRef);

  const { data: row } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .eq("provider_ref", providerRef)
    .maybeSingle<MatchRow>();

  if (!row) return null;
  return matchRecordFromRow(row);
}

/** Live matches (status LIVE/PAUSED), upcoming fixtures, and recent past results, across the 5 top-flight leagues. */
export async function getFixtures(): Promise<{
  live: FixtureRecord[];
  upcoming: FixtureRecord[];
  past: FixtureRecord[];
}> {
  const supabase = createSupabaseServiceClient();

  const { data: rows } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .order("kickoff_at", { ascending: false })
    .limit(60)
    .returns<MatchRow[]>();

  const records = (rows ?? []).map(matchRecordFromRow).filter((r): r is FixtureRecord => r !== null);

  return {
    live: records.filter((r) => r.match.status === "LIVE" || r.match.status === "PAUSED"),
    upcoming: records
      .filter((r) => r.match.status === "SCHEDULED")
      .sort((a, b) => a.match.kickoffAt.localeCompare(b.match.kickoffAt)),
    past: records.filter((r) => r.match.status === "FINISHED"),
  };
}

/**
 * A club's own recent finished results, queried directly by team rather than
 * filtered out of the globally-capped `getFixtures()` window — that global
 * top-60-across-5-leagues window could crowd out a specific club's matches
 * (the "only 2 Man City results" bug), so this looks up the club's team row
 * and queries matches by it directly.
 */
export async function getRecentResultsForClub(
  clubProviderRef: string,
  limit = 5,
): Promise<FixtureRecord[]> {
  const supabase = createSupabaseServiceClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("id")
    .eq("provider_ref", clubProviderRef)
    .maybeSingle<{ id: number }>();
  if (!club) return [];

  const { data: team } = await supabase
    .from("teams")
    .select("id")
    .eq("club_id", club.id)
    .maybeSingle<{ id: number }>();
  if (!team) return [];

  const { data: rows } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .eq("status", "FINISHED")
    .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
    .order("kickoff_at", { ascending: false })
    .limit(limit)
    .returns<MatchRow[]>();

  return (rows ?? []).map(matchRecordFromRow).filter((r): r is FixtureRecord => r !== null);
}

export type StandingsRow = {
  rank: number;
  club: Club;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalDiff: number;
};

type StandingDbRow = {
  rank: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goal_diff: number;
  clubs: ClubRow;
};

/** Full table for a competition, read from the `standings` cache table. */
export async function getStandings(competitionProviderRef: string): Promise<StandingsRow[]> {
  const supabase = createSupabaseServiceClient();

  const { data: competition } = await supabase
    .from("competitions")
    .select("id")
    .eq("provider_ref", competitionProviderRef)
    .maybeSingle<{ id: number }>();
  if (!competition) return [];

  const { data: rows } = await supabase
    .from("standings")
    .select("rank, points, played, won, drawn, lost, goal_diff, clubs(*)")
    .eq("competition_id", competition.id)
    .order("rank", { ascending: true })
    .returns<StandingDbRow[]>();

  return (rows ?? []).map((row) => ({
    rank: row.rank,
    club: clubFromRow(row.clubs, competitionProviderRef),
    points: row.points,
    played: row.played,
    won: row.won,
    drawn: row.drawn,
    lost: row.lost,
    goalDiff: row.goal_diff,
  }));
}
