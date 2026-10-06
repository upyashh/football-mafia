#!/usr/bin/env node
// Smoke-checks the mock OpenFootAPI service's contract shapes against a running
// `pnpm dev` instance. Run manually (no test framework in this repo):
//
//   pnpm --filter web dev &
//   node packages/mock-data/scripts/verify-provider-contract.mjs
//
// MOCK_PROVIDER_PLAN must be set on the *server* process (not this script) to exercise
// the developer-tier path, since gating is decided server-side:
//
//   MOCK_PROVIDER_PLAN=developer pnpm --filter web dev &
//   MOCK_PROVIDER_PLAN=developer node packages/mock-data/scripts/verify-provider-contract.mjs
//
// Exits non-zero on the first failed assertion.

const BASE = process.env.MOCK_PROVIDER_BASE_URL ?? "http://localhost:3000/api/mock-openfoot/v1";
const TOKEN = process.env.MOCK_PROVIDER_TOKEN ?? "dev-token";
const PLAN = process.env.MOCK_PROVIDER_PLAN ?? "starter";

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    failures += 1;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`ok: ${message}`);
  }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const body = await res.json();
  return { status: res.status, body };
}

async function main() {
  console.log(`Verifying mock provider contract against ${BASE} (plan=${PLAN})`);

  // No auth -> 401
  const noAuth = await fetch(`${BASE}/matches`);
  assert(noAuth.status === 401, "GET /matches with no Authorization header returns 401");

  // Health, unauthenticated
  const health = await get("/health");
  assert(health.status === 200, "GET /health returns 200");

  // Matches list
  const matches = await get("/matches");
  assert(matches.status === 200, "GET /matches returns 200");
  assert(Array.isArray(matches.body.data), "GET /matches body.data is an array");
  assert(matches.body.meta?.access?.plan === PLAN, "GET /matches meta.access.plan matches configured plan");
  assert(matches.body.meta?.environment === "beta", "GET /matches meta.environment is 'beta'");
  assert(matches.body.data.length >= 4, "GET /matches returns all scripted scenarios");

  const liveMatch = matches.body.data.find((m) => m.status === "live");
  assert(!!liveMatch, "at least one scenario resolves to status=live");

  // Status filter
  const scheduled = await get("/matches?status=scheduled");
  assert(
    scheduled.body.data.every((m) => m.status === "scheduled"),
    "GET /matches?status=scheduled only returns scheduled matches",
  );

  // Single match
  if (liveMatch) {
    const single = await get(`/matches/${liveMatch.id}`);
    assert(single.status === 200, "GET /matches/{id} returns 200 for a known id");
    assert(single.body.data.id === liveMatch.id, "GET /matches/{id} returns the requested match");
  }

  const missing = await get("/matches/does-not-exist");
  assert(missing.status === 404 && missing.body.error?.code === "not_found", "GET /matches/{unknown-id} returns 404 not_found");

  // Gated endpoints
  if (liveMatch) {
    const events = await get(`/matches/${liveMatch.id}/events`);
    if (PLAN === "starter") {
      assert(events.status === 403, "GET /matches/{id}/events is gated on starter plan");
      assert(events.body.error?.code === "plan_upgrade_required", "gated response uses plan_upgrade_required error code");
    } else {
      assert(events.status === 200, "GET /matches/{id}/events succeeds on developer plan");
      assert(Array.isArray(events.body.data), "events body.data is an array");
    }

    const lineups = await get(`/matches/${liveMatch.id}/lineups`);
    assert(
      lineups.status === (PLAN === "starter" ? 403 : 200),
      `GET /matches/{id}/lineups gating matches plan (${PLAN})`,
    );
  }

  // context is Starter-available, ungated
  if (liveMatch) {
    const context = await get(`/matches/${liveMatch.id}/context`);
    assert(context.status === 200, "GET /matches/{id}/context is not gated");
  }

  // live/stream always gated (stubbed)
  const stream = await get("/live/stream");
  assert(stream.status === 403 && stream.body.error?.code === "plan_upgrade_required", "GET /live/stream always returns plan_upgrade_required");

  // competitions
  const competitions = await get("/competitions");
  assert(competitions.status === 200 && competitions.body.data.length > 0, "GET /competitions returns data");

  // standings requires competition param
  const standingsMissingParam = await get("/standings");
  assert(standingsMissingParam.status === 400, "GET /standings with no competition param returns 400");

  const standings = await get("/standings?competition=comp-pl");
  assert(standings.status === 200 && Array.isArray(standings.body.data), "GET /standings?competition=comp-pl returns data");

  // quota counter moves
  const before = matches.body.meta.access.used;
  const after = (await get("/matches")).body.meta.access.used;
  assert(after > before, "meta.access.used increases across repeated requests");

  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error("Verification script crashed:", err);
  process.exit(1);
});
