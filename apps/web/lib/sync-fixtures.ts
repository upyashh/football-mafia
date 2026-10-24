import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  COMPETITION_LEAGUE_IDS,
  currentSeasonYear,
  fetchFixtures,
  fetchStandings,
  mapFixtureStatus,
  type ApiFootballFixture,
} from "@/lib/api-football";

/**
 * The only place that calls the provider on a schedule (Vercel Cron route +
 * the one-off backfill script) — never from a request-serving path, so page
 * loads are pure DB reads and the 100 req/day budget is spent predictably:
 * 1 fixtures call + 1 standings call per league per run (free tier rejects
 * the `last`/`next` fixtures params, so each run pulls the whole season).
 */

type TeamByProviderRef = Map<string, { id: number }>;
type CompetitionByProviderRef = Map<string, { id: number }>;

async function loadReferenceMaps(supabase: ReturnType<typeof createSupabaseServiceClient>): Promise<{
  teamByProviderRef: TeamByProviderRef;
  competitionByProviderRef: CompetitionByProviderRef;
}> {
  const [{ data: teamRows }, { data: competitionRows }] = await Promise.all([
    supabase.from("teams").select("id, provider_ref"),
    supabase.from("competitions").select("id, provider_ref"),
  ]);

  const teamByProviderRef: TeamByProviderRef = new Map();
  for (const row of teamRows ?? []) teamByProviderRef.set(row.provider_ref, { id: row.id });

  const competitionByProviderRef: CompetitionByProviderRef = new Map();
  for (const row of competitionRows ?? []) competitionByProviderRef.set(row.provider_ref, { id: row.id });

  return { teamByProviderRef, competitionByProviderRef };
}

function fixtureToRow(
  fixture: ApiFootballFixture,
  competitionId: number,
  teamByProviderRef: TeamByProviderRef,
) {
  const homeTeam = teamByProviderRef.get(String(fixture.teams.home.id));
  const awayTeam = teamByProviderRef.get(String(fixture.teams.away.id));
  return {
    provider_ref: String(fixture.fixture.id),
    competition_id: competitionId,
    home_team_id: homeTeam?.id ?? null,
    away_team_id: awayTeam?.id ?? null,
    kickoff_at: fixture.fixture.date,
    status: mapFixtureStatus(fixture.fixture.status.short),
    minute: fixture.fixture.status.elapsed,
    home_score: fixture.goals.home ?? 0,
    away_score: fixture.goals.away ?? 0,
    last_polled_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function syncCompetitionFixtures(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  leagueId: number,
  season: number,
  teamByProviderRef: TeamByProviderRef,
  competitionByProviderRef: CompetitionByProviderRef,
): Promise<void> {
  const competition = competitionByProviderRef.get(String(leagueId));
  if (!competition) return;

  // Free-tier plans reject `last`/`next` params, so fetch the whole season.
  // We're pinned to a past season (see currentSeasonYear), so "recent" isn't
  // relative to real-world now — just keep every fixture for the season;
  // it's one season's worth (~380 matches), nowhere near a payload concern.
  const all = await fetchFixtures({ league: leagueId, season });

  const rows = all
    .map((fixture) => fixtureToRow(fixture, competition.id, teamByProviderRef))
    .filter((row) => row.home_team_id !== null && row.away_team_id !== null);

  if (rows.length === 0) return;

  await supabase.from("matches").upsert(rows, { onConflict: "provider_ref" });
}

async function syncCompetitionStandings(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  leagueId: number,
  season: number,
  competitionByProviderRef: CompetitionByProviderRef,
): Promise<void> {
  const competition = competitionByProviderRef.get(String(leagueId));
  if (!competition) return;

  const standings = await fetchStandings({ league: leagueId, season });

  const { data: clubRows } = await supabase
    .from("clubs")
    .select("id, provider_ref")
    .eq("competition_id", competition.id);
  const clubByProviderRef = new Map((clubRows ?? []).map((c) => [c.provider_ref, c.id]));

  const rows = standings
    .map((row) => ({
      competition_id: competition.id,
      club_id: clubByProviderRef.get(String(row.team.id)) ?? null,
      rank: row.rank,
      points: row.points,
      played: row.all.played,
      won: row.all.win,
      drawn: row.all.draw,
      lost: row.all.lose,
      goal_diff: row.all.goals.for - row.all.goals.against,
      updated_at: new Date().toISOString(),
    }))
    .filter((row) => row.club_id !== null);

  if (rows.length === 0) return;

  await supabase.from("standings").upsert(rows, { onConflict: "competition_id,club_id" });
}

/** Syncs fixtures + standings for all 5 seeded competitions. Called only by the cron route and the backfill script. */
export async function syncAllCompetitions(): Promise<void> {
  const supabase = createSupabaseServiceClient();
  const season = currentSeasonYear();
  const { teamByProviderRef, competitionByProviderRef } = await loadReferenceMaps(supabase);

  await Promise.all(
    COMPETITION_LEAGUE_IDS.map((leagueId) =>
      syncCompetitionFixtures(supabase, leagueId, season, teamByProviderRef, competitionByProviderRef).catch(
        (err) => console.error(`[sync-fixtures] fixtures sync failed for league ${leagueId}:`, err),
      ),
    ),
  );

  await Promise.all(
    COMPETITION_LEAGUE_IDS.map((leagueId) =>
      syncCompetitionStandings(supabase, leagueId, season, competitionByProviderRef).catch((err) =>
        console.error(`[sync-fixtures] standings sync failed for league ${leagueId}:`, err),
      ),
    ),
  );
}
