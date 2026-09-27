# Product Requirements Document
## Live Football Social Platform — v1.0

**Status:** Draft for review — synthesized from two source documents (working plan, July 2026; raw brainstorm brief, v0.1)
**Owner:** [Vishwaas] + co-founder
**Purpose:** This is the base document for downstream UX, design, and technical architecture work. Every subsequent doc (`user-flows.md`, `design-system.md`, `technical-architecture.md`, etc.) should treat this as source of truth until it is explicitly revised.

---

## 0. How this document was built

Two source documents were merged:

- **Doc A ("Working Plan")** — the more decided, current-recommendation version: club-identity-first, phased roadmap, specific tech stack (Next.js + Supabase) and data providers already chosen, cold-start via a single club.
- **Doc B ("Raw Brainstorm")** — the earlier, more exploratory version: match-room-first ("digital stadium"), richer live-room mechanics (fan mood, prediction reputation, room taxonomy), broader MVP surface, cold-start via marquee global matches (World Cup, El Clásico).

Where the two agree, this PRD states it as settled. Where they genuinely conflict, this PRD picks the direction from Doc A (since it is explicitly marked as the most recent source of truth) but **flags the conflict explicitly in Section 12** so it gets a deliberate human decision rather than silently disappearing.

---

## 1. Product Vision & Positioning

**Vision:** Create a place where football fans experience live matches together, even when physically apart — so a fan never has to watch a big match alone.

**Positioning:** FotMob's live-score utility + X's live conversation + a fantasy/prediction competition layer, in one football-native app. Not a stats app with a comment section, and not a generic chat app with football skinned on top — a **match-centric social platform**.

**Strategic analog:** Sleeper beat ESPN/Yahoo fantasy by making the league a group chat — bringing conversation that already existed off-platform (in WhatsApp, group chats, sports bars) into the product itself. This is the direct blueprint.

**One-sentence spine:** Club/team identity gets people in, match day brings them back, fan cred makes them stay.

**Emotional promise to the user:** *"I may be sitting alone, but I'm not watching this game alone."*

---

## 2. The Problem

Football is inherently social — fans want to celebrate goals, complain about referees, debate tactics, predict outcomes, and feel part of something larger — but no existing tool is built around the specific moment of *"I am watching this match right now and want to experience it with other fans."*

| Tool | Good at | Falls short because |
|---|---|---|
| FotMob / SofaScore / OneFootball | Scores, stats, lineups, fixtures | Not designed for social interaction — utility with no community |
| WhatsApp | Talking to existing friends | Friends may not be watching; not discoverable; no match structure |
| Discord | Communities, chat, voice | Generic, not football-native; live match context isn't integrated |
| Reddit | Football communities, opinion | Thread-based/asynchronous, not built for fast live interaction |
| X/Twitter | Real-time reaction | Extremely noisy; not structured around watching *this* match together |
| YouTube live chat | Mass simultaneous reaction | Attached to a creator/stream; noisy; no persistent football identity |
| Google Meet/Zoom | Watching with friends | Requires friends to be free; not discoverable |

**The gap:** check the score *and* react with fellow fans, in the same place, without needing pre-existing friends to be online.

---

## 3. Core Hypothesis (what the MVP must prove)

> Football fans will repeatedly join and participate in a dedicated live match room while watching a match, because it makes watching football more social — and this holds even without a large network of existing friends on the platform.

Sub-hypotheses to validate along the way:
- A scores utility is useful (and retains users) even at low community density, de-risking quiet early days.
- Club/team identity assigned at signup solves the "empty feed" cold-start problem better than a generic follow-graph.
- A one-tap "I watched this" match log creates single-player value independent of whether anyone else is active.
- Predictions increase session frequency around kickoff without becoming a gambling product.

---

## 4. Target Users

### Primary persona: "The Solo Fan"
A fan watching an important match (derby, international tournament, rivalry fixture) who has no one immediately available to watch with — friends are offline, asleep (timezone), or simply don't care about this particular match. Wants to feel the crowd, not just see the score.

### Secondary personas
- **Hardcore multi-league fan** — follows several competitions, wants tactical depth, stats, predictions, reputation.
- **Community-oriented fan** — cares about club/country/local-community identity more than any single match.
- **Existing friend groups** — already watch together via WhatsApp/Meet; want a better football-native version of what they already do (private rooms).

### Explicitly not the primary target (for now)
Casual fans with no strong club/country affiliation; fans primarily seeking betting/gambling-style engagement; fans who only want elite statistical depth (that's FotMob's job, not ours).

---

## 5. Product Pillars

1. **Live scores are the hook, not the edge.** We license data for the top 5–10 leagues/competitions; we do not try to out-cover FotMob's 500+ leagues. Scores must be useful daily even with very few users — this is what removes the social cold-start problem for the utility layer.
2. **Live chat per match is the differentiator.** The app is match-centric, not feed-centric. Home surfaces live matches; each match page has Stats | Lineups | **Chat** tabs, with goal/card/sub events appearing as inline markers inside the chat feed itself.
3. **Identity is the foundation.** Every user picks a club/country affiliation at signup. This shapes their default feed, their profile colors, which rooms they land in, and their rivalries. Identity solves cold start by giving every new user a non-empty home feed on day one.
4. **The match log is the retention record.** One-tap "I watched this" (Letterboxd pattern) on any match, with optional match and player ratings. Builds a personal fan diary (matches watched, average rating, best match of the season, shareable end-of-season recap) — this has value even with zero social activity, which is what makes it a durable retention mechanic rather than something dependent on network effects.
5. **Competition (predictions → fantasy) is the layer that brings people back on a schedule**, but it is sequenced, not front-loaded: pre-match predictions first, FPL integration second, an own fantasy game only after real traction is demonstrated. This avoids building a full fantasy engine before we know anyone wants the core product.

---

## 6. Core Loops

**Identity loop:** pick club/country → feed and rooms reflect it → participating builds visible fan cred → deeper investment in the platform.

**Match-day loop:** fixture kicks off → user is pulled into the live room → reacts with fellow fans → goals/red cards/major events create peak emotional moments → user returns for the next fixture. Fixtures function as a built-in appointment calendar — this is a structural retention advantage over generic social apps.

**Competition loop:** predict before kickoff (locked at KO) → see the result → check the leaderboard against your club/friends → predict again next match.

**Content loop:** post a take or reaction → fellow fans (and rivals) respond → notifications pull the user back in.

**Shared pattern across all loops** (per Letterboxd/Strava/Untappd/Sleeper reference class): a structured object + a one-tap verb (film → logged, run → recorded, match → watched/predicted) creates a personal record, which becomes identity, which becomes a social layer, which becomes a recurring ritual (matchday, season, yearly recap). Free-form posting is downstream of structure, never the foundation of it — this should discipline every future feature decision.

---

## 7. Reference Class Lessons (why the roadmap is sequenced this way)

- **Letterboxd** — the one-tap diary is valuable at zero followers; taste-as-identity; non-algorithmic chronological feeds work fine at niche scale; durable growth took ~9 years and came from organic love, not paid acquisition. → *Underpins the match-log feature and the decision not to build an algorithmic feed early.*
- **Strava** — content should create itself from behavior (GPS = the post); minimize what users have to type; low-friction reactions (kudos); asynchronous competition (segments). → *Underpins keeping reactions/predictions low-friction rather than requiring long-form posts.*
- **Goodreads** — a cautionary tale: network effects can let a stagnant product survive and let incumbents get lazy; its best feature is a public-commitment device (the annual Reading Challenge). → *Our analog is the season-long prediction streak / end-of-season wrapped recap — don't let us coast on network effects instead of continuing to improve the core loop.*
- **Untappd** — gamified logging works well for passive-consumption activities (check-in + badges), which matches the posture of "watching a match." → *Supports the match-log + badge mechanics.*
- **Sleeper** — chat-first fantasy, where the league literally is a group chat. → *Direct blueprint for making the match room the center of gravity instead of a bolt-on comment section.*

---

## 8. Scope: MVP (Phase 1) — Functional Requirements

> Framing: the MVP must answer one question — will fans actively participate in a dedicated live room while watching a match? Everything not required to answer that question is deferred.

### 8.1 Authentication & Profile
- Sign up / log in
- Username, basic profile
- **Mandatory** club/country affiliation selection at signup (identity is not optional — it is the cold-start mechanism)
- Profile rendered in club/country colors

**User story:** *As a new user, I select my club during signup so that my home feed and default room are populated immediately, with zero cold-start emptiness.*
**Acceptance criteria:** Signup cannot complete without a club/country selection; immediately after signup the user's feed shows content from their club community (not an empty state).

### 8.2 Match Discovery & Match Page
- Live matches, upcoming fixtures, recent results for licensed top-5–10 competitions
- Match page shows teams, score, clock/status, lineups, stats, and a live event timeline
- Tabs: **Stats | Lineups | Chat**

**Acceptance criteria:** Score/event data updates within the latency budget defined by the data provider tier (see §11); match page loads and renders correctly with zero live events (pre-match state) and with a full timeline (post-match state).

### 8.3 Stands & Live Match Chat

> **Updated 2026-09-19 — supersedes the "one global room" framing below.** See `decisions.md` ("Room taxonomy: Stands replace the single global room") for the full decision record. This resolves §12.2 and §12.3 in favor of Doc B's richer taxonomy.

- **Stands** are persistent communities, not spawned per match, with three visibility levels: **public global** (e.g. a "Global Terrace"), **public community** (e.g. a city/regional stand like "HSR Bangalore"), and **private/invite-only** (friend groups).
- A user can belong to multiple Stands. Opening a Stand while more than one match is live shows the member which live match's chat to join — hierarchy is **Stand → match → chat**.
- Each `(stand, match)` pair has its own independent chat thread and live-viewer count — the same match's chat in "Global Terrace" and in a private friend Stand are separate rooms, not one room filtered by membership.
- Text messages + emoji reactions
- Goal / card / substitution events appear as inline markers inside the chat stream, not as a separate feed
- Join/leave a Stand; live participant count visible per (stand, match) room
- **Ephemeral chat:** a match's chat in a given Stand disappears some time after full-time — no replay/history browsing in MVP (see `decisions.md`)
- Basic moderation: report button, mute, word filters, rate limiting

**User story:** *As a fan watching alone, I want to see the goal event appear in the same stream as fan reactions so that the moment feels shared rather than reported to me after the fact.*
**Acceptance criteria:** A goal event ingested from the data provider produces an inline marker in the chat feed within [latency budget] of the event; reporting a message removes it from the reporter's view immediately and flags it for moderation review; rate limiting prevents a single user from exceeding [N messages/minute — to be set].

### 8.3a Stands directory / switcher
- A dedicated screen listing Stands a user can join or has joined: name, visibility (public/private), live/active member count, total member count.
- Users can join public Stands directly; private Stands require an invite.

**Acceptance criteria:** A new user can discover and join at least one public Stand beyond their default club community without any invite.

### 8.4 Club Community Feed
- Default feed = user's club community (chronological, not algorithmic — chronological is explicitly fine below ~50k users)
- Posts: text + one image, comments, likes, follows

**Acceptance criteria:** New users with zero follows still see a populated, relevant feed via club membership alone.

### 8.7 Predict (added to MVP 2026-09-19 — see `decisions.md`)
- Standalone **Predict** tab (peer to Live/Stands/Profile).
- Pre-match pick per fixture (e.g. win/draw/loss or scoreline), locked at kickoff, resolved automatically against match data once it's final.
- **Flash pick:** a rolling in-match prediction shown inline in the live view (both the Stands chat and the global match view) — e.g. "next 5 mins: Goal / Card / Corner / Quiet" — with a live % breakdown of what other users in that `(stand, match)` room picked. Locks/resolves on a short timer, not at kickoff.
- Basic personal result feedback: last prediction's outcome and any points/XP gained, surfaced on the global match view per the reference designs.

**User story:** *As a fan, I want to make a quick pick on what happens next and see how my read compares to everyone else's, so predicting feels like part of watching, not a separate app.*
**Acceptance criteria:** A pre-match pick cannot be submitted after kickoff; a flash pick cannot be changed after its window closes; both resolve automatically without manual intervention once the relevant match/event data is final.

### 8.5 Match Log
- One-tap "I watched this" on any match page
- Optional match rating (and, later, player ratings — Phase 3)

**User story:** *As a fan, I want to log that I watched a match and rate it, so I build a personal record of my season even if no one else is active.*
**Acceptance criteria:** Logging a match works fully offline of any social interaction; logged matches accumulate into a visible personal history on the profile.

### 8.6 Explicitly OUT of MVP
DMs, voice chat, video/streaming, full fantasy football engine, betting/payments, creator monetization, news aggregation, algorithmic feed ranking, multi-sport support, precise location-based discovery, advanced player analytics, elaborate badge/gamification systems, chat replay/archive for finished matches.

*Rationale:* every one of these either adds moderation/legal surface area before the core loop is validated, or adds complexity that doesn't help answer the core hypothesis in §3.

*Note (2026-09-19): private user-created rooms were previously listed here as deferred; per the updated §8.3/§12.2/§12.3 decision, private Stands are now IN MVP.*

---

## 9. Scope: Phase 2 — Predictions & Re-engagement

- Pre-match score predictions, locked at kickoff, resolved automatically against match data
- Per-club and per-friend-group leaderboards
- Goal notifications for followed teams/matches — flagged as a **major** re-engagement channel (FotMob's own usage patterns validate this)
- Post-match: live chat highlights roll up into a permanent match thread (so the room isn't ephemeral — it becomes part of the match-log/diary artifact)

**Success gate to enter Phase 2:** MVP metrics (see §13) show meaningful live-room participation; without that, predictions risk becoming a feature on top of an unvalidated core loop.

---

## 10. Scope: Phase 3 — Fan Cred, FPL, Rivalry

- Player ratings per match, aggregated per fanbase (e.g., "Arsenal fans rated Saka 8.2") — designed explicitly as a shareable-screenshot growth channel
- FPL companion via the open FPL API: link team, live rank, mini-leagues, FPL trash talk inside match chats
- Derby-week rivalry rooms, with human-reviewed rules (rivalry is the engine of engagement but also the primary toxicity risk — see §14)
- Streaks/badges for match-day attendance
- End-of-season "wrapped" recap generated from the match log

### Later / only with demonstrated traction
An own differentiated fantasy game (e.g., daily/per-matchweek or club-only fantasy — not a generic FPL clone), native mobile apps.

### Deliberately never (unless research changes this)
Full video/streaming (cost + rights risk — sit alongside whatever broadcast the user is already watching, don't become a streaming platform), generic multi-sport expansion, a full news platform.

---

## 11. Data Strategy

| Stage | Provider | Notes |
|---|---|---|
| **Current dev/build** | **Self-built mock API**, same contract as OpenFootAPI | Simulates live matches (scripted score/event progression) — no real fetch. Built specifically so the real OpenFootAPI (or another provider) is a base-URL/config swap later, not a rewrite. See `decisions.md` "Data provider for MVP: self-built mock API". |
| Real-data validation | **OpenFootAPI**, Starter tier (free, 5,000 req/mo) | Evaluated and confirmed live 2026-09-14/2026-09-19 — see `provider-adapter.md`. Covers fixtures, live score/status, standings; goal/card/sub event timelines, lineups, and SSE push need the Developer tier ($14/mo); Starter's binding constraint is the monthly quota, not a per-minute limit. |
| Launch | OpenFootAPI Developer tier (or re-evaluate at decision time) | Unlocks real event/lineup data + more quota headroom |
| Scale | Paid tier of the same or a comparable provider | **Verify current pricing at decision time**, not from this document |
| Fantasy companion | FPL API (open, unofficial) | Free; powers all Phase 3 fantasy-companion features |

**Architectural rules (non-negotiable):**
- Users never call provider APIs directly — our backend polls once, stores results, and fans out via our own realtime layer, so rate limits are per-app, not per-user.
- All provider calls go through a **thin adapter layer** using our own internal match/team IDs, so switching providers later is a configuration change, not a schema migration.
- Never scrape FotMob or similar (their ToS prohibits automated access) and avoid "free, no rate limit" APIs of unclear provenance — likely scraped, legally risky, and can vanish without notice.
- Club crests and league logos are trademarked — use club **names and colors**, not official badges, until a licensing decision is made. Score data must come from a licensed source, full stop.

---

## 12. Open Decisions Requiring Explicit Human Approval

These are genuine conflicts or unresolved points between the two source documents. **Do not let engineering or design silently resolve these — they need a product decision first.**

1. **Cold-start strategy: single-club vs. marquee-event.**
 - Doc A: launch with **one club**, pick a large/underserved/extremely-online fanbase, seed via its subreddit/Discord/fan-Twitter, expand club by club (campus-by-campus model).
 - Doc B: launch anchored on **marquee global matches** (World Cup, Champions League knockouts, El Clásico) where concentrated demand exists regardless of club affiliation.
 - *These are different go-to-market motions and probably imply different acquisition channels and different launch timing (event calendar vs. any time). Needs a decision before marketing/launch planning starts.*

2. **Room taxonomy: one global room vs. room-per-affiliation.** — **RESOLVED 2026-09-19, see `decisions.md`.**
 - Doc A implies a single match chat room per match (with events as inline markers), keeping rivalry rooms as a Phase 3 feature.
 - Doc B proposes richer taxonomy from the start — global room, per-team rooms, per-country rooms, per-city/local rooms — while simultaneously warning against creating dozens of empty rooms.
 - *Resolution: reference designs made clear that community-fragmented rooms ("Stands") are core to the product feel, not deferrable. MVP now ships Stands (public global / public community / private) with a stand→match→chat hierarchy — see §8.3.* This reverses this PRD's original recommendation in favor of Doc B.

3. **Private, invite-only rooms: MVP or later?** — **RESOLVED 2026-09-19, see `decisions.md`.**
 - Doc B includes user-created private rooms (a WhatsApp/Meet replacement for existing friend groups) as part of its proposed MVP.
 - Doc A defers anything room-taxonomy-related beyond the global room to Phase 3 ("Derby-week rivalry rooms").
 - *Resolution: private Stands are now IN MVP, resolved together with decision #2 above — a private Stand is just a Stand with `visibility = private`, not a separate mechanic.*

4. **Predictions timing.** — **RESOLVED 2026-09-19, see `decisions.md`.**
 - Doc A sequences predictions into Phase 2, after the core scores+chat+identity loop is validated.
 - Doc B includes basic predictions in its proposed MVP.
 - *Resolution: predictions are pulled into MVP — both a pre-match pick and a live in-match "flash pick" widget, plus a standalone Predict tab. See §8.7. This reverses Doc A's sequencing in favor of Doc B, confirmed explicitly rather than inferred from the reference designs alone.*

5. **Fan mood / prediction-reputation mechanics** (Doc B, §13 and §12 of the raw brainstorm) are not currently placed on any phase of this roadmap. They are lower priority than the core loops but should be explicitly triaged into Phase 2/3 backlog or explicitly cut, rather than left in limbo.

---

## 13. Success Metrics

| Phase | Primary metrics |
|---|---|
| Phase 1 (MVP) | Do new users post/comment in their first session; daily opens (proves the scores utility retains on its own) |
| Phase 2 | **% of users active during a live match** — the single most important number; it directly tests the core hypothesis in §3. Prediction participation rate. |
| Phase 3 | Week-4 retention; % of signups originating from shared screenshots/invites |

**Candidate North Star (needs refinement before build):** *Active Fan Match Sessions* — a session where a user joins a live match room and meaningfully participates (sends a message, reacts, or predicts), not merely opens the app.

**Additional activation/engagement metrics worth instrumenting from day one** (from the raw brainstorm, useful even before they're "the" metric):
- % of new users who join a match room in their first session
- Average session duration, messages/reactions/predictions per session during a live match
- % of match viewers who enter a room at all
- Invitations sent, private rooms created (once/if that feature ships), users per private room

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **Cold start** — nobody's there, so it feels dead | Single-club (or marquee-event, pending §12 decision) launch strategy; scores utility remains useful even with a thin community, de-risking quiet early days |
| **Users just stay on WhatsApp/Discord/Reddit/X** | Differentiate on live social context (who's watching *right now*), football-native interaction (predictions, match-event markers), and identity/fan-cred — not on chat features generically |
| **Chat becomes toxic** (rivalry is the engine but tips into abuse fast) | Moderation basics (report/mute/word-filter/rate-limit) shipped in MVP, not bolted on later; human-reviewed rules specifically for rivalry rooms before those ship in Phase 3 |
| **Spam/bots in public rooms** | Rate limiting + reporting from MVP; revisit stronger anti-abuse tooling before opening additional public rooms |
| **Feature creep** — becoming "FootMob + Reddit + Discord + Twitter + fantasy + betting" | Hold the line on the explicit out-of-MVP list (§8.6) and the phase gates in §9–10; no feature ships ahead of its phase without an explicit decision per §12's model |
| **Live sports data cost** | Provider tiering in §11 with a thin adapter layer so switching is a config change; verify current pricing before committing budget |
| **Real-time infra spikes during marquee matches** | Needs explicit architecture work (fan-out/realtime messaging patterns) sized for the cold-start strategy chosen in §12 — a marquee-event launch implies bigger spikes sooner than a single-club launch |
| **Legal/licensing** — data licensing, crests/logos, trademarks, prediction regulation | Use club names/colors, not official badges, until a licensing decision is made; score data only from licensed providers; predictions framed explicitly as entertainment/social, not gambling, in all copy and mechanics |
| **Seasonality** — engagement craters off-season | Transfer-rumor discussion and community content are the off-season bridge; worth an explicit content/ops plan before the first off-season hits |

---

## 15. User Research To Run Before Locking UX/Technical Docs

This PRD is still built on unvalidated assumptions. Before the technical architecture and design-system docs are finalized, run interviews covering:

- **Current behavior:** What do you do when watching alone? Do you use WhatsApp/Reddit/X/YouTube live chat/FotMob/SofaScore during matches? Have you ever joined a football Discord?
- **Pain:** What sucks about watching alone? Do you actually want to talk to strangers while watching? What makes you leave a live chat?
- **Product reaction:** Would you use a football-specific live room? What would make it better than WhatsApp? Would you make predictions and care about your accuracy? Would you join team-specific rooms? Would you create a private room? (This last question directly informs the §12 decision on private rooms.)

Also, before finalizing differentiation claims, do a structured competitive pass on: FotMob, SofaScore, OneFootball, ESPN, football-focused Discord servers/subreddits, and any existing sports-prediction/social apps or watch-party products — confirming what they already do well and where the actual gap is, rather than assuming it.

---

## 16. Non-Functional Requirements (initial, to be expanded in the technical architecture doc)

- **Latency:** live event markers (goals/cards/subs) should appear in the match room within the bound implied by the current data-provider tier (§11) — this is a hard external constraint until a paid tier is purchased.
- **Realtime fan-out:** must support sudden concurrency spikes during marquee fixtures without degrading chat responsiveness; sizing depends on the §12 cold-start decision.
- **Moderation:** report/mute/rate-limit must be present at MVP launch, not retrofitted.
- **Data integrity:** the provider adapter layer must isolate the rest of the system from any single provider's schema, given the explicit intent to be able to switch providers later.
- **Legal:** no redistribution of official crests/logos without a licensing decision; no scraping of any competitor's data.

---

## 17. Recommended Next Steps

1. Resolve the five open decisions in §12 — these materially change scope, launch motion, and technical sizing.
2. Run the user research in §15, at minimum the behavior and product-reaction questions, before locking `user-flows.md`.
3. Produce `technical-architecture.md` against the MVP scope in §8 and the data strategy in §11 (Next.js + Supabase is the current recommendation per Doc A but should be re-confirmed, not assumed, once §12 is resolved — a marquee-event cold start with spiky concurrency may push architecture choices differently than a single-club launch).
4. Produce `design-system.md` and `user-flows.md` for the MVP surface only (§8) — do not design for Phase 2/3 features yet.
5. Define the exact MVP success bar (a specific number, not just "engagement") before writing acceptance tests for launch.
