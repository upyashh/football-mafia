import "server-only";

/**
 * Shared API-Football v3 client (https://v3.football.api-sports.io).
 * Auth is a flat `x-apisports-key` header (not Bearer), every response is
 * wrapped in `{ response: [...] }`, and almost every data endpoint requires
 * a `season` query param (the year the season *started* — European top
 * flights run Aug-May, so "current" flips over in August).
 */

export const LEAGUE_IDS = {
  premierLeague: 39,
  laLiga: 140,
  serieA: 135,
  bundesliga: 78,
  ligue1: 61,
} as const;

export const COMPETITION_LEAGUE_IDS = Object.values(LEAGUE_IDS);

/**
 * API-Football's free plan only has access to seasons 2022-2024 (confirmed
 * via a live 403: `"Free plans do not have access to this season, try from
 * 2022 to 2024."`) — hardcoded to the latest season that plan covers rather
 * than computed from today's date, until/unless the plan is upgraded.
 */
export function currentSeasonYear(): number {
  return 2024;
}

function providerBaseUrl(): string {
  return process.env.PROVIDER_BASE_URL || "https://v3.football.api-sports.io";
}

function providerApiKey(): string {
  return process.env.PROVIDER_API_KEY || "";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasErrors(errors: unknown): boolean {
  if (!errors) return false;
  return Array.isArray(errors) ? errors.length > 0 : Object.keys(errors as object).length > 0;
}

/**
 * Free tier caps requests/minute (not just /day), and a rate-limit hit can
 * come back as either HTTP 429 or HTTP 200 with `errors.rateLimit` — retry
 * both with backoff rather than letting a transient cap kill the sync.
 */
export async function fetchApiFootball<T>(
  path: string,
  params: Record<string, string | number>,
  attempt = 1,
): Promise<T[]> {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  );
  const res = await fetch(`${providerBaseUrl()}${path}?${query}`, {
    headers: { "x-apisports-key": providerApiKey() },
    cache: "no-store",
  });
  if (res.status === 429 && attempt <= 5) {
    const retryAfterHeader = Number(res.headers.get("retry-after"));
    const delayMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader * 1000 : attempt * 10000;
    await sleep(delayMs);
    return fetchApiFootball<T>(path, params, attempt + 1);
  }
  if (!res.ok) {
    throw new Error(`api-football ${path} failed: ${res.status}`);
  }
  const body = (await res.json()) as { response: T[]; errors?: unknown };
  if ((body.errors as { rateLimit?: string } | undefined)?.rateLimit && attempt <= 5) {
    await sleep(attempt * 10000);
    return fetchApiFootball<T>(path, params, attempt + 1);
  }
  if (hasErrors(body.errors)) {
    throw new Error(`api-football ${path} returned errors: ${JSON.stringify(body.errors)}`);
  }
  return body.response;
}

export type ApiFootballFixtureStatusShort =
  | "TBD"
  | "NS"
  | "1H"
  | "HT"
  | "2H"
  | "ET"
  | "BT"
  | "P"
  | "SUSP"
  | "INT"
  | "FT"
  | "AET"
  | "PEN"
  | "PST"
  | "CANC"
  | "ABD"
  | "AWD"
  | "WO"
  | "LIVE";

export type MappedMatchStatus = "SCHEDULED" | "LIVE" | "PAUSED" | "FINISHED";

export function mapFixtureStatus(short: ApiFootballFixtureStatusShort): MappedMatchStatus {
  switch (short) {
    case "1H":
    case "2H":
    case "ET":
    case "P":
    case "LIVE":
      return "LIVE";
    case "HT":
    case "BT":
      return "PAUSED";
    case "FT":
    case "AET":
    case "PEN":
      return "FINISHED";
    default:
      // TBD, NS, SUSP, INT, PST, CANC, ABD, AWD, WO — none map to a result
      // yet, and there's no POSTPONED state in the matches check constraint.
      return "SCHEDULED";
  }
}

export type ApiFootballFixture = {
  fixture: {
    id: number;
    date: string;
    status: { short: ApiFootballFixtureStatusShort; elapsed: number | null };
  };
  league: { id: number };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  goals: { home: number | null; away: number | null };
};

/**
 * Free-tier plans reject the `last`/`next` params ("Free plans do not have
 * access to the Last parameter"), so this always fetches the whole season's
 * fixtures for the league — callers split recent/upcoming by date client-side.
 */
export async function fetchFixtures(params: {
  league: number;
  season: number;
}): Promise<ApiFootballFixture[]> {
  return fetchApiFootball<ApiFootballFixture>("/fixtures", params);
}

export type ApiFootballStandingRow = {
  rank: number;
  team: { id: number; name: string };
  points: number;
  all: { played: number; win: number; draw: number; lose: number; goals: { for: number; against: number } };
};

type ApiFootballStandingsResponse = {
  league: { id: number; standings: ApiFootballStandingRow[][] };
};

export async function fetchStandings(params: {
  league: number;
  season: number;
}): Promise<ApiFootballStandingRow[]> {
  const response = await fetchApiFootball<ApiFootballStandingsResponse>("/standings", params);
  return response[0]?.league.standings[0] ?? [];
}

export type ApiFootballLeague = {
  league: { id: number; name: string; type: string };
  country: { code: string | null };
};

export async function fetchLeague(leagueId: number, season: number): Promise<ApiFootballLeague | null> {
  const rows = await fetchApiFootball<ApiFootballLeague>("/leagues", { id: leagueId, season });
  return rows[0] ?? null;
}

export type ApiFootballTeam = {
  team: { id: number; name: string; code: string | null };
};

export async function fetchTeams(leagueId: number, season: number): Promise<ApiFootballTeam[]> {
  return fetchApiFootball<ApiFootballTeam>("/teams", { league: leagueId, season });
}
