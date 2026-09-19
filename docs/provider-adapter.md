# Provider Adapter — OpenFootAPI

Concrete adapter spec for `technical-architecture.md` §7 ("one module, one responsibility: translate provider payloads ↔ our internal shapes"). Verified against the live API on 2026-09-14 with a Starter-tier key, and re-verified 2026-09-19 with a fresh Starter key (same tier gating held; new findings below on quota, SSE, and competitions coverage). See `decisions.md` for the tier-gating decision this surfaced.

> ⚠️ The API's own `environment` field reports `"beta"` on every response — treat OpenFootAPI itself as not yet production-stable, not just its pricing/tiers as subject to change.

## Base

```
https://openfootapi.com/v1
Authorization: Bearer <key>   (server/worker-only — never NEXT_PUBLIC_)
```

## Plan gating (verified live, not from docs alone)

| Endpoint | Starter (free, 5,000 req/mo) | Developer ($14/mo, 250,000 req/mo) |
|---|---|---|
| `GET /v1/matches` (fixtures, live status/score/minute) | ✅ | ✅ |
| `GET /v1/standings` | ✅ | ✅ |
| `GET /v1/matches/{id}/context` (form, Elo, xG, odds) | ✅ | ✅ |
| `GET /v1/matches/{id}/events` (goal/card/sub timeline) | ❌ `plan_upgrade_required` | ✅ |
| `GET /v1/matches/{id}/lineups` | ❌ `plan_upgrade_required` | ✅ |
| `GET /v1/matches/{id}/xg` (shot map) | ❌ (implied, same tier boundary) | ✅ |
| `GET /v1/live/stream` (SSE) | ❌ `plan_upgrade_required` — **confirmed 2026-09-19**, not just untested | ✅ |
| `GET /v1/competitions` | ✅ **confirmed 2026-09-19** — 120 competitions, `availableSeasons`, `coverage` flags, source provenance | ✅ |
| Webhooks (goal/kickoff/fulltime only) | untested | ✅ (per docs) |
| `GET /v1/health` | ✅ (free, no auth needed for basic status) | ✅ |

**Consequence:** on the free key we can do real fixture lists, live score/status ticking, standings, and now confirmed the full competitions list, today. We cannot get real goal/card/sub events, lineups, xG, or the SSE push stream until we upgrade. Until then, `getMatchEvents` for *real* matches should return an empty/unavailable state in the UI rather than fabricate events — do not silently substitute the Phase 2 simulated script for a real match's events, that would misrepresent a real game.

**Even on Developer, "realtime" is soft:** OpenFootAPI's own docs describe the SSE stream as delivering "goal alerts and status changes within about a minute, plus periodic match ticks" — i.e. push doesn't mean sub-second, it means ~1-minute freshness instead of whatever our poll interval is. This narrows the case for upgrading purely for latency; the bigger unlock from Developer is the *data* (real events/lineups), not materially lower latency than a well-tuned Starter poll loop.

### ⚠️ Starter quota is the real constraint, not the per-minute rate limit (found 2026-09-19)

5,000 requests/month sounds generous until it's divided by a live-match poll loop: polling **5 competitions every 60s** alone is `5 × 60 × 24 × 30 ≈ 216,000 req/month` — 43× the Starter quota, exhausted in under a day. There is no visible per-minute throttle on real keys (only the public demo key `of_demo_openfootapi_docs` is capped, at 30 req/min) — the binding constraint is the monthly quota, self-reported live in every response's `meta.access.{quota,used,remaining,period}`.

**Implication for the ingestion worker (§5 of `technical-architecture.md`):** the naive "poll one centralized matches call every 15–90s" design assumed in that doc will blow the Starter quota almost immediately. Before writing the real worker, either (a) poll far coarser and only for competitions/dates known to have matches today (use `/v1/matches?date=` narrowly, not a broad sweep), (b) budget for Developer tier ($14/mo, 250k req/mo — this quota alone may justify the upgrade before the event/lineup data does), or (c) both. Log `meta.access.remaining` on every poll so the worker can self-throttle before hitting a hard wall, not after.

### Match ID churn — confirmed, worse than expected (found 2026-09-19)

The 2026-09 provider migration is live and biting now: legacy `match_of_es1_*` / `match_of_it1_*` / `match_of_fr1_*` IDs 404, `match_olg_*` (Bundesliga) 404s for past seasons, and only EPL kept a compatibility alias. This confirms and sharpens the existing "treat `provider_ref` as opaque, don't parse structure" guidance below — additionally, **never persist/cache a match ID across a season boundary without re-resolving it** via `/v1/matches?competition=&season=` for the canonical current ID.

## Adapter interface (matches `technical-architecture.md` §7, typed against our internal shapes in `packages/mock-data/src/types.ts`)

```ts
interface FootballProvider {
  listFixtures(params: { date?: string; competitionId?: string; status?: MatchStatus }): Promise<Match[]>;
  getMatch(providerRef: string): Promise<Match | null>;
  getMatchEvents(providerRef: string): Promise<MatchEvent[]>; // throws ProviderPlanError on Starter
  getStandings(competitionId: string): Promise<Standing[]>;
}
```

Nothing outside this module ever sees `openfootapi`'s field names (`homeTeam.shortName`, `kickoffAt`, provider match IDs like `match_fmb_es1_...`) — those are mapped to our `matches`/`teams` rows via the `provider_ref` columns in `supabase/migrations/0001_init.sql`, exactly as §7 specifies.

## Field mapping: OpenFootAPI `/v1/matches` → our `Match`

| OpenFootAPI field | Our field | Notes |
|---|---|---|
| `id` | `matches.provider_ref` | e.g. `match_fmb_es1_2026-27_20260915_rayo_vallecano_espanyol`. **Do not parse structure out of this string** — the docs' own migration notice shows prefixes change per-competition and per-migration (`match_fmb_*` vs legacy `match_olg_*` vs retired `match_of_*`). Treat it as an opaque key. |
| `competitionId` | `competitions.provider_ref` → join to our `competitions.id` | |
| `homeTeam.id` / `awayTeam.id` | `teams.provider_ref` → our `teams.id` | Team `id`s are stable OpenFootAPI IDs (`team_rayo_vallecano_es`), independent of the match-ID migration churn above — safe to key off directly. |
| `kickoffAt` | `matches.kickoff_at` | Already ISO 8601 UTC — no conversion needed server-side; convert only in the client for display. |
| `status` (`scheduled\|live\|finished\|postponed`) | `matches.status` | Map `scheduled→SCHEDULED`, `live→LIVE`, `finished→FINISHED`. **`postponed` has no equivalent in our `MatchStatus` enum yet** (`SCHEDULED\|LIVE\|PAUSED\|FINISHED`) — open gap, flagged below. No `paused`/half-time value observed from this provider; our `PAUSED` state may need to be inferred from `minute === 45 && period` rather than a direct status map — untested, no live match was in HT during this exploration. |
| `score.home` / `score.away` | `matches.home_score` / `away_score` | `null` pre-kickoff — map to `0`, not `null` (our schema's `int` columns assume a started match once `status != SCHEDULED`). |
| `minute`, `addedTime`, `period` | `matches.minute` | `period` (halves) not yet modeled in our schema — carries HT/45+ information the `paused` state above needs. |
| `sourceRefs[].id` | `match_events.provider_event_key` material | Use `sourceRefs[0].id` (the upstream fotmob ref) as the stable idempotency key once event ingestion is unlocked — this is exactly the "verify before promising" idempotency point in §5.2. |

## Open gap to resolve before writing the real ingestion worker (M2)

Our `MatchStatus` (`packages/mock-data/src/types.ts`) has no `postponed` value, and OpenFootAPI's `status` enum has no explicit half-time/paused value — these two gaps sit on opposite sides of the same mapping and should be closed together, not worked around ad hoc in the adapter. Left open here rather than guessed at.

## Rate limits observed

- Starter: 5,000 req/month (observed via `meta.access.quota`/`used`/`remaining` on every response — the API self-reports quota, so the worker can log remaining budget each poll rather than tracking it separately).
- Demo key (`of_demo_openfootapi_docs`, public, no signup): 30 req/min, same endpoint coverage as Starter — useful for local dev without burning the real key's monthly quota.
