# Decisions Log

Running record of decisions made while building this project — so context survives across sessions and across switching between this and the day job. Add a new entry whenever an open question (especially from `prd.md` §12) gets resolved; never silently let the code decide.

Format per entry: **Decision**, **Why**, **Date**.

---

## Open (block schema work until resolved)

- **Cold-start strategy** — single club vs. marquee event as the app's first-run focus. Affects whether the fixtures table prioritizes one club's matches or "big matches globally."

## Open (block schema work until resolved)

- **Cold-start strategy** — single club vs. marquee event as the app's first-run focus. Affects whether the fixtures table prioritizes one club's matches or "big matches globally."

## Resolved

### Predictions: pulled into MVP

**Decision:** Predictions are now in-scope for MVP, not Phase 2. This resolves PRD §12.4. Concretely: a pre-match pick (per PRD §9's original Phase 2 spec) **and** the live in-match "flash pick" widget shown in the Stitch reference (e.g. "next 5 mins: Goal/Card/Corner/Quiet", with a live % breakdown of what other users in the room picked) are both MVP. A standalone **Predict** tab (alongside Live/Stands/Profile) is also MVP.

**Why:** The reference designs (2026-09-19) made Predict a top-level tab equal to the other core screens, and confirmed explicitly by the user rather than left as an inference from the mockups alone.

**How to apply:** `predictions` table in `technical-architecture.md` §4 is no longer forward-compat-only — build the real write path (`submitPrediction`, locked at kickoff for pre-match picks; a short-window lock for flash picks) into the MVP build sequence (§16), not deferred to Phase 2. Flash picks are scoped per `(stand, match)` room, same as chat, since they're shown inline in that same live view. PRD §8/§9 need a real MVP subsection for this (added as §8.7).

**Date:** 2026-09-19

### Data provider for MVP: self-built mock API, same contract as OpenFootAPI

**Decision:** Instead of calling the real OpenFootAPI during MVP build, we build our own mock data API/service that **only simulates live matches** (scripted score/event progression over time) but exposes the **exact same request/response contract** as OpenFootAPI (`/v1/matches`, `/v1/matches/{id}/events`, `/v1/matches/{id}/lineups`, field shapes, `meta.access` quota block, error shapes like `plan_upgrade_required`). The ingestion worker and provider adapter (`technical-architecture.md` §7, `provider-adapter.md`) are written against this contract from day one.

**Why:** Real OpenFootAPI has two problems for active development: (1) Starter's 5,000 req/month quota is too tight to develop/test against freely (see the quota math in `provider-adapter.md`), and (2) real matches don't happen on a schedule convenient for building/demoing — a scripted mock match (with a real goal event at a known minute) is far better for building and testing the chat/event-marker/prediction UI than waiting for a real fixture. Because the adapter isolates the rest of the system from the provider's actual field names (per `technical-architecture.md` §7's whole design point), swapping the mock service's base URL for the real OpenFootAPI later is meant to be a config change, not a rewrite — this decision is exactly what that isolation was built for.

**How to apply:** Build a small internal service (or a Next.js route group acting as one) implementing OpenFootAPI's documented contract, backed by scripted match scenarios (replacing/superseding the ad-hoc fixtures already in `packages/mock-data`). The adapter (`FootballProvider` interface in `provider-adapter.md`) points at this mock service's base URL via config/env, not at `openfootapi.com`. Keep the mock service honest to the real contract — including the tier-gating error shapes and quota block — so contract tests (`technical-architecture.md` §7) written against it stay valid when we eventually point the same adapter at the real API. Real OpenFootAPI integration (with a paid key, if warranted per the quota/latency tradeoffs already documented) is deferred to a later decision, not ruled out.

**Date:** 2026-09-19

### Room taxonomy: Stands replace the single global room {#room-taxonomy-stands}

**Decision:** Supersedes "one global chat room per match" below. Stands are persistent, first-class communities — not spawned per match — with three visibility levels: **public global** (e.g. "Global Terrace"), **public community** (e.g. "HSR Bangalore"), and **private/invite-only** (friend groups). Hierarchy is **stand → match → chat**: when a Stand's members open it while multiple matches are live at once (e.g. Barca–Real and Utd–City simultaneously), they choose which match's chat to join. Each `(stand, match)` pair gets its own independent chat thread and viewer count — not one shared match-chat filtered by stand membership (confirmed by the reference screens showing "Global Room 18.4k" vs. "Friends Stand 7 watching" as separate counts for the same match).

**Why:** The Google Stitch reference designs made clear that fragmenting by community is core to the product feel, not a Phase 3 nice-to-have for this build — closer to Discord's server→channel model than a single global chatroom. This also resolves PRD §12.2 (room taxonomy) and §12.3 (private rooms) in favor of Doc B's richer taxonomy, reversing this PRD's original recommendation.

**How to apply:** Schema needs a first-class `stands` table (id, name, visibility: `public_global` | `public_community` | `private`, owner, member count) independent of `matches`. `chat_rooms` keys on `unique(stand_id, match_id)`, not `unique(match_id, type)` as modeled in `technical-architecture.md` §4 — that table and §17's "single global room" assumption need updating. Build a Stands-switcher screen (list stands, show live/total member counts, join public ones, request/accept for private ones) — this was previously ruled out ("don't build any room-selection UI") and is now required.

**Date:** 2026-09-19

### Chat persistence: ephemeral, no replay for MVP

**Decision:** A match's chat inside a given Stand disappears some time after the match ends. No message history browsing or replay in MVP.

**Why:** Keeps storage/pagination simple and avoids building an archival UX before the core live mechanic (per-stand live chat) is proven with real users. PRD §9 already earmarks "chat rolls up into a permanent match thread" as a Phase 2 idea — this decision defers that explicitly.

**How to apply:** `messages`/`chat_rooms` rows for a finished match can be hard-deleted or TTL'd after full-time plus a buffer. Don't build any read path for finished-match chat history in MVP.

**Date:** 2026-09-19

### Room taxonomy: one global chat room per match (superseded — see [[room-taxonomy-stands]] above)

**Decision:** MVP ships exactly one chat room per match (`chat_rooms.type = 'global'`, `unique(match_id, type)`). No per-club, per-country, or rivalry rooms.

**Why:** Confirmed in the original UI brief and restated as the schema assumption in `technical-architecture.md` §4/§17. Richer taxonomy (rivalry rooms, per-club rooms) is explicitly Phase 3 and would multiply the realtime fan-out surface (§6.3) before we've proven the core one-room mechanic works with real users.

**How to apply:** Every match gets exactly one `chat_rooms` row, created alongside the match (or lazily on first access). Don't build any room-selection UI. `EventMarker`s interleave into this same room's message stream, not a separate channel.

**Date:** 2026-09-14

---

### Data provider: OpenFootAPI, Starter tier — event/lineup detail gated to Developer ($14/mo)

**Decision:** Use OpenFootAPI as the real provider behind the adapter (`docs/provider-adapter.md`). Starter (free, 5,000 req/mo) covers `/v1/matches` (fixtures, live status, live score, standings) — enough for score/status ticking. `/v1/matches/{id}/events` (goal/card/sub timeline) and `/v1/matches/{id}/lineups` return `plan_upgrade_required` on Starter; they need the $14/mo Developer tier.

**Why:** Verified directly against the live API on 2026-09-14 (see `docs/provider-adapter.md`). This changes the M2/M4 build sequence in `technical-architecture.md`: we can wire real score/status ticking on the free tier today, but the granular `EventMarker` timeline (what actually makes the chat feel alive per PRD §8.3) requires either the paid tier or staying on the simulated event script from Phase 2.

**How to apply:** Keep simulating `match_events` (our own scripted timeline) until the Developer tier is purchased or budget is confirmed. The adapter's `getMatchEvents`/`listLiveMatches` calls should be written now against OpenFootAPI's real shape so upgrading tiers later is a config flag, not a rewrite.

**Date:** 2026-09-14
