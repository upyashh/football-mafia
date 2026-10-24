import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { fetchApiFootball, mapFixtureStatus, type ApiFootballFixture } from "@/lib/api-football";

/**
 * Server-side read-through cache for a single match's live data
 * (API-Football v3). Freshness rule: FINISHED matches are permanently
 * cached and never re-fetched. LIVE/SCHEDULED matches are re-fetched if the
 * cached row is older than LIVE_REFRESH_MS, so the provider isn't hit on
 * every request but live scores still move.
 *
 * Scope note: events/lineups/stats are gated per-league by API-Football's
 * `coverage` object, not by plan tier — `getCachedMatchEvents` stays a
 * stable empty stub until a specific league's coverage is confirmed and
 * wired up.
 */
const LIVE_REFRESH_MS = 15_000;

type MatchStatus = "SCHEDULED" | "LIVE" | "PAUSED" | "FINISHED";

export type CachedMatchRow = {
  id: number;
  provider_ref: string;
  competition_id: number | null;
  home_team_id: number | null;
  away_team_id: number | null;
  kickoff_at: string;
  status: MatchStatus;
  minute: number | null;
  home_score: number | null;
  away_score: number | null;
  last_polled_at: string | null;
  updated_at: string;
};

async function resolveTeamId(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  providerRef: string,
): Promise<number | null> {
  const { data } = await supabase.from("teams").select("id").eq("provider_ref", providerRef).maybeSingle();
  return data?.id ?? null;
}

async function resolveCompetitionId(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  providerRef: string,
): Promise<number | null> {
  const { data } = await supabase.from("competitions").select("id").eq("provider_ref", providerRef).maybeSingle();
  return data?.id ?? null;
}

function isFresh(row: CachedMatchRow): boolean {
  if (row.status === "FINISHED") return true;
  if (!row.last_polled_at) return false;
  return Date.now() - new Date(row.last_polled_at).getTime() < LIVE_REFRESH_MS;
}

/**
 * Ensures the DB has an up-to-date row for this provider fixture id,
 * fetching from the provider only on a cache miss or staleness. Returns the
 * cached (now-fresh) match row.
 */
async function ensureMatchSynced(providerRef: string): Promise<CachedMatchRow> {
  const supabase = createSupabaseServiceClient();

  const { data: existing } = await supabase
    .from("matches")
    .select("*")
    .eq("provider_ref", providerRef)
    .maybeSingle<CachedMatchRow>();

  if (existing && isFresh(existing)) {
    return existing;
  }

  const rows = await fetchApiFootball<ApiFootballFixture>("/fixtures", { id: providerRef });
  const fixture = rows[0];
  if (!fixture) {
    throw new Error(`provider has no fixture ${providerRef}`);
  }

  const [competitionId, homeTeamId, awayTeamId] = await Promise.all([
    resolveCompetitionId(supabase, String(fixture.league.id)),
    resolveTeamId(supabase, String(fixture.teams.home.id)),
    resolveTeamId(supabase, String(fixture.teams.away.id)),
  ]);

  const { data: upserted, error } = await supabase
    .from("matches")
    .upsert(
      {
        provider_ref: String(fixture.fixture.id),
        competition_id: competitionId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        kickoff_at: fixture.fixture.date,
        status: mapFixtureStatus(fixture.fixture.status.short),
        minute: fixture.fixture.status.elapsed,
        home_score: fixture.goals.home ?? 0,
        away_score: fixture.goals.away ?? 0,
        last_polled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "provider_ref" },
    )
    .select("*")
    .single<CachedMatchRow>();

  if (error || !upserted) {
    throw new Error(`Failed to upsert match ${providerRef}: ${error?.message}`);
  }

  return upserted;
}

export async function getCachedMatch(providerRef: string): Promise<CachedMatchRow> {
  return ensureMatchSynced(providerRef);
}

/**
 * Always empty for now: no seeded league's coverage.fixtures.events has
 * been confirmed yet. Kept as a stable export so callers don't need to
 * special-case "no events" vs "not implemented yet".
 */
export async function getCachedMatchEvents(_providerRef: string): Promise<never[]> {
  return [];
}
