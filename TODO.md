# TODO — MVP

Gap analysis of MVP scope (`docs/prd.md` §8, `docs/decisions.md`, `docs/technical-architecture.md` §16) against the current code. Last reviewed 2026-09-27.

**Current state:** a front-end prototype running on mock data. It has Onboarding, Feed, Matches and Profile, plus a match page with Stats/Lineups/Events/Chat tabs, all driven by one scripted live match. No backend has been started.

---

## Front end (buildable now on mock data)

### Stands — PRD §8.3 / §8.3a
- [ ] Add a `Stand` type and fixtures (`public_global` / `public_community` / `private`, with live and total member counts) in `packages/mock-data`
- [ ] Stands directory/switcher screen: list joined and joinable Stands, join public ones, invite-only for private ones
- [ ] Stand → match picker when more than one match is live
- [ ] Scope chat to each `(stand, match)` room with its own viewer count (today chat is per match)
- [ ] Add a Stands tab to `BottomNav`

### Predict — PRD §8.7
- [ ] Predict tab
- [ ] Pre-match pick per fixture, locked at kickoff
- [ ] Flash-pick widget in the live chat view ("next 5 mins: Goal / Card / Corner / Quiet"), scoped to each `(stand, match)` room, with a live % breakdown and a short lock window
- [ ] Result feedback: the last pick's outcome and points/XP

### Match log — PRD §8.5
- [ ] `MatchLogPrompt` on the match page after full time: an "I watched this" button plus an optional rating
- [ ] Show newly logged matches in the Profile history (today it only reads fixtures)

### Moderation UI — PRD §8.3
- [ ] Report a message: hide it from the reporter immediately and flag it for review
- [ ] Mute a user
- [ ] Client-side stubs for the rate limit and word filter

### Club feed — PRD §8.4
- [ ] Like and comment actions (counts are display-only today)
- [ ] Follow a user
- [ ] Post composer (text plus one image)

### Mock data
- [ ] Upcoming fixtures, plus a pre-match state on the match page (PRD §8.2)
- [ ] Several matches live at once, to exercise choosing a match inside a Stand
- [ ] Rework the mock data into scenarios for the mock API that follows the OpenFootAPI contract (see M1)

### Polish (optional)
- [ ] Shield-style `ClubBadge` using club colours. No official crests (PRD §11).

---

## Backend (architecture §16 milestones)

### M0 — Foundations
- [ ] Supabase projects for staging and production
- [ ] Real auth, with the club required at signup (`profiles`)
- [ ] Row-level security (RLS) baseline, plus policy tests
- [ ] Pick and set up a test runner (none exists yet)
- [ ] CI: lint, build, tests on every PR

### Schema
- [ ] Update `supabase/migrations/0001_init.sql`:
  - [ ] add a `stands` table
  - [ ] make `chat_rooms` unique on `(stand_id, match_id)`
  - [ ] add `predictions`, `flash_picks` and `flash_pick_votes` (architecture §4)

### M1 — Mock data service + adapter
- [ ] Mock API that follows the OpenFootAPI contract (`/v1/matches`, `/events`, `/lineups`, the `meta.access` quota block, `plan_upgrade_required`), backed by scripted scenarios
- [ ] `FootballProvider` adapter (`docs/provider-adapter.md`), with the base URL read from config
- [ ] Contract tests against the mock service and against recorded real responses
- [ ] Resolve the `postponed` / half-time status mapping gap

### M2 — Ingestion worker
- [ ] Always-on poll loop that diffs each response and upserts events idempotently (keyed on `sourceRefs[0].id`)

### M3 — Match pages + Stands (persisted)
- [ ] Discovery list, Stands join/request/accept, Stats and Lineups served from stored data

### M4 — Live room
- [ ] Realtime Broadcast channel per `(stand, match)`
- [ ] Send path with zod validation and moderation hooks
- [ ] Event markers interleaved into chat, plus participant count (Presence)
- [ ] TTL cleanup of ephemeral chat after full time

### M5 — Predict
- [ ] `submitPrediction` (locked at kickoff) and `submitFlashPick` (short window) server actions
- [ ] Auto-resolution against final match and event data

### M6 — Community feed + match log
- [ ] Persist posts, comments, likes and follows
- [ ] Persist match log entries and ratings

### M7 — Hardening
- [ ] Rate limits; report and mute working end to end
- [ ] Sentry and observability (client, server, worker)
- [ ] Load test the §6.3 fan-out against the chosen launch strategy (single club vs. marquee event)
- [ ] Security review (OWASP Top 10)

---

## Docs
- [ ] Rewrite `docs/ui-brief.md` §4–7 for Stands and Predict (the nav becomes Live / Stands / Predict / Profile)
- [ ] Remove the duplicated "Open" block in `docs/decisions.md`
- [ ] Log each decision below in `docs/decisions.md` once it's resolved

---

## Decisions needing human approval
- [ ] Cold-start strategy: single club vs. marquee event
- [ ] Ingestion worker host (Railway / Fly.io / Render / Vercel Cron), architecture §14
- [ ] Realtime substrate: Supabase Broadcast vs. a managed alternative, architecture §14
- [ ] Whether and when to buy the OpenFootAPI Developer tier
- [ ] Crest/logo licensing (until decided: names and colours only)

---

## Suggested order
1. Stands
2. Upcoming and multiple live fixtures
3. `MatchLogPrompt`
4. Predict
5. Feed interactions and moderation UI
6. Schema update and M0
