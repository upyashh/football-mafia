#!/usr/bin/env node
/**
 * One-off backfill: re-seeds competitions/clubs/teams from API-Football's
 * live /leagues + /teams data (so the DB has real numeric provider_refs),
 * then syncs fixtures + standings. Run once after switching providers:
 *
 *   pnpm --filter web sync:backfill
 *
 * Requires PROVIDER_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * in apps/web/.env.local (loaded below via dotenv).
 */
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  let contents;
  try {
    contents = readFileSync(envPath, "utf8");
  } catch {
    return;
  }
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const LEAGUES = [
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 135, name: "Serie A" },
  { id: 78, name: "Bundesliga" },
  { id: 61, name: "Ligue 1" },
];

// API-Football's free plan only covers seasons 2022-2024 (confirmed via a
// live 403: "Free plans do not have access to this season, try from 2022
// to 2024.") — pinned here to match lib/api-football.ts's currentSeasonYear().
function currentSeasonYear() {
  return 2024;
}

function providerBaseUrl() {
  return process.env.PROVIDER_BASE_URL || "https://v3.football.api-sports.io";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Free tier caps requests/minute (not just /day) — retry 429s with backoff
// (honoring Retry-After when present) instead of letting one rate-limit
// blip kill the whole backfill run partway through.
async function fetchApiFootball(apiPath, params, attempt = 1) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  );
  const res = await fetch(`${providerBaseUrl()}${apiPath}?${query}`, {
    headers: { "x-apisports-key": process.env.PROVIDER_API_KEY ?? "" },
  });
  if (res.status === 429 && attempt <= 5) {
    const retryAfterHeader = Number(res.headers.get("retry-after"));
    const delayMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
      ? retryAfterHeader * 1000
      : attempt * 5000;
    console.warn(`  [rate-limited] ${apiPath} — retrying in ${Math.round(delayMs / 1000)}s (attempt ${attempt})`);
    await sleep(delayMs);
    return fetchApiFootball(apiPath, params, attempt + 1);
  }
  if (!res.ok) throw new Error(`api-football ${apiPath} failed: ${res.status}`);
  const body = await res.json();
  // Rate limiting sometimes comes back as HTTP 200 with errors.rateLimit
  // instead of a 429 status — retry that the same way.
  if (body.errors?.rateLimit && attempt <= 5) {
    const delayMs = attempt * 10000;
    console.warn(`  [rate-limited] ${apiPath} — retrying in ${Math.round(delayMs / 1000)}s (attempt ${attempt})`);
    await sleep(delayMs);
    return fetchApiFootball(apiPath, params, attempt + 1);
  }
  if (body.errors && (Array.isArray(body.errors) ? body.errors.length > 0 : Object.keys(body.errors).length > 0)) {
    throw new Error(`api-football ${apiPath} returned errors: ${JSON.stringify(body.errors)}`);
  }
  // Small spacing between calls so we don't immediately re-trip the
  // per-minute limit on the next request.
  await sleep(2500);
  return body.response;
}

function mapFixtureStatus(short) {
  if (["1H", "2H", "ET", "P", "LIVE"].includes(short)) return "LIVE";
  if (["HT", "BT"].includes(short)) return "PAUSED";
  if (["FT", "AET", "PEN"].includes(short)) return "FINISHED";
  return "SCHEDULED";
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey || !process.env.PROVIDER_API_KEY) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / PROVIDER_API_KEY in .env.local",
    );
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const season = currentSeasonYear();

  console.log(`[backfill] season=${season}`);

  for (const league of LEAGUES) {
    console.log(`[backfill] ${league.name} (league ${league.id})`);

    const leagueRows = await fetchApiFootball("/leagues", { id: league.id, season });
    const leagueInfo = leagueRows[0];
    const countryCode = leagueInfo?.country?.code ?? null;

    const { data: competition, error: competitionError } = await supabase
      .from("competitions")
      .upsert(
        { provider_ref: String(league.id), name: league.name, country_code: countryCode },
        { onConflict: "provider_ref" },
      )
      .select("id")
      .single();
    if (competitionError || !competition) throw new Error(`upsert competition failed: ${competitionError?.message}`);

    const teams = await fetchApiFootball("/teams", { league: league.id, season });
    console.log(`  ${teams.length} teams`);

    for (const { team } of teams) {
      const clubRef = `club-${slugify(team.name)}`;
      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .upsert(
          {
            provider_ref: clubRef,
            competition_id: competition.id,
            name: team.name,
            short_name: team.code ?? team.name.slice(0, 3).toUpperCase(),
          },
          { onConflict: "provider_ref" },
        )
        .select("id")
        .single();
      if (clubError || !club) {
        console.error(`  club upsert failed for ${team.name}: ${clubError?.message}`);
        continue;
      }

      const { error: teamError } = await supabase
        .from("teams")
        .upsert(
          { provider_ref: String(team.id), club_id: club.id, name: team.name },
          { onConflict: "provider_ref" },
        );
      if (teamError) console.error(`  team upsert failed for ${team.name}: ${teamError.message}`);
    }
  }

  console.log("[backfill] reference data done, syncing fixtures + standings...");

  const { data: teamRows } = await supabase.from("teams").select("id, provider_ref");
  const teamByProviderRef = new Map((teamRows ?? []).map((r) => [r.provider_ref, r.id]));
  const { data: competitionRows } = await supabase.from("competitions").select("id, provider_ref");
  const competitionByProviderRef = new Map((competitionRows ?? []).map((r) => [r.provider_ref, r.id]));

  for (const league of LEAGUES) {
    const competitionId = competitionByProviderRef.get(String(league.id));
    if (!competitionId) continue;

    // Free-tier plans reject `last`/`next` params ("Free plans do not have
    // access to the Last parameter") — fetch the whole season instead.
    const all = await fetchApiFootball("/fixtures", { league: league.id, season });

    const rows = all
      .map((fixture) => ({
        provider_ref: String(fixture.fixture.id),
        competition_id: competitionId,
        home_team_id: teamByProviderRef.get(String(fixture.teams.home.id)) ?? null,
        away_team_id: teamByProviderRef.get(String(fixture.teams.away.id)) ?? null,
        kickoff_at: fixture.fixture.date,
        status: mapFixtureStatus(fixture.fixture.status.short),
        minute: fixture.fixture.status.elapsed,
        home_score: fixture.goals.home ?? 0,
        away_score: fixture.goals.away ?? 0,
        last_polled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      .filter((row) => row.home_team_id !== null && row.away_team_id !== null);

    if (rows.length > 0) {
      const { error } = await supabase.from("matches").upsert(rows, { onConflict: "provider_ref" });
      if (error) console.error(`  fixtures upsert failed for ${league.name}: ${error.message}`);
      else console.log(`  ${league.name}: ${rows.length} fixtures synced`);
    }

    const standingsResponse = await fetchApiFootball("/standings", { league: league.id, season });
    const standings = standingsResponse[0]?.league?.standings?.[0] ?? [];

    const { data: clubRows } = await supabase.from("clubs").select("id, provider_ref").eq("competition_id", competitionId);
    const clubIdByTeamName = new Map((clubRows ?? []).map((c) => [c.provider_ref, c.id]));

    const standingsRows = standings
      .map((row) => {
        const clubRef = `club-${slugify(row.team.name)}`;
        return {
          competition_id: competitionId,
          club_id: clubIdByTeamName.get(clubRef) ?? null,
          rank: row.rank,
          points: row.points,
          played: row.all.played,
          won: row.all.win,
          drawn: row.all.draw,
          lost: row.all.lose,
          goal_diff: row.all.goals.for - row.all.goals.against,
          updated_at: new Date().toISOString(),
        };
      })
      .filter((row) => row.club_id !== null);

    if (standingsRows.length > 0) {
      const { error } = await supabase.from("standings").upsert(standingsRows, { onConflict: "competition_id,club_id" });
      if (error) console.error(`  standings upsert failed for ${league.name}: ${error.message}`);
      else console.log(`  ${league.name}: ${standingsRows.length} standings rows synced`);
    }
  }

  console.log("[backfill] done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
