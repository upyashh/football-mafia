# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Football Mafia — a mobile-first live football social platform (live match chat scoped to "Stands", club feed, predictions, match log). Currently a **front-end prototype running entirely on mock data**; there is no backend wired up yet. Product and architecture live in `docs/` and are the source of truth for scope.

## Commands

pnpm workspace (Node >= 20). Run from the repo root:

```bash
pnpm install
pnpm dev     # next dev for apps/web (http://localhost:3000)
pnpm build   # next build for apps/web
pnpm lint    # eslint for apps/web
```

There is no test runner configured yet. `pnpm build` is the type-check.

## Layout and how the pieces connect

- `apps/web` — Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui on `@base-ui/react`, lucide icons. Path alias `@/*` → `apps/web/*`.
  - **Next.js 16 has breaking changes from what you may know.** `apps/web/AGENTS.md` (pulled in by `apps/web/CLAUDE.md`) says to read the relevant guide in `apps/web/node_modules/next/dist/docs/` before writing Next code. `next dev` re-adds that block automatically, so leave it alone.
  - Route groups: `app/(main)/` (feed, matches, profile) share a `max-w-md` shell with `BottomNav`. `app/match/[id]` and `app/onboarding` sit outside that shell. `app/page.tsx` redirects to `/feed` or `/onboarding` on the client, based on `hasOnboarded()`.
- `packages/mock-data` (`@football-mafia/mock-data`) — typed fixtures plus the data-access API that the web app consumes. It is shipped as raw TS (`main: ./src/index.ts`) and compiled via `transpilePackages` in `apps/web/next.config.ts`.
  - The getters in `src/index.ts` are deliberately `async`, so they can be swapped for real Supabase/API calls later by changing only their bodies. Keep new data access behind this API and don't import fixtures directly into components. The few sync exports (`clubs`, `currentUser`, `getClubForTeamId`) exist only for first-paint needs such as theming.
  - Domain types are in `src/types.ts`. `docs/provider-adapter.md` maps provider fields onto these shapes.
- `supabase/migrations/0001_init.sql` — draft schema. It **predates the Stands decision**: it still models one global chat room per match. Follow `docs/decisions.md` / `docs/technical-architecture.md` §4 (`stands` table, `chat_rooms` unique on `(stand_id, match_id)`) instead.

### Simulated live match

One scripted live match drives all of the "live" UI:
1. `packages/mock-data/src/live-match.ts` → `resolveLiveMatchState()` is a **pure function of elapsed time since kickoff**. It derives status, minute, score, events so far and chat messages so far from the scripts in `fixtures/liveMatch.ts`. `SIM_MS_PER_MINUTE` (1500ms) controls demo pacing.
2. `apps/web/lib/live-match-store.ts` is a module-level store keyed by match. It polls `getLiveMatchState` once a second, notifies listeners only when state changes, and stops at `FINISHED` or for non-live matches.
3. `apps/web/lib/use-live-match.ts` is the React hook components use.

Everything is built so that a real ingestion worker + Supabase Realtime can replace this later without touching components. Keep live score/chat/events flowing through this single source, never hardcoded in JSX.

### Mock user and club theming

There's one mock signed-in user (`currentUser`). Onboarding does not create an identity. It only stores the chosen club in `localStorage` (`ff-selected-club-id`, see `lib/current-user.ts` / `lib/use-selected-club.ts`). `ClubAccentProvider` writes that club's `primaryColor` to the `--club-accent` CSS variable on `<html>`. Club-specific styling should go through that token, not per-club variants. Legal constraint from the PRD: use club colour + name only, never official crests or logos.

## Docs, and which ones are stale

- `docs/decisions.md` is the running decisions log. When an open question (especially PRD §12 / architecture §14) gets resolved, add an entry (Decision / Why / How to apply / Date) instead of letting the code decide on its own. Newer entries supersede older ones.
- Key decisions currently in force (2026-09-19):
  - **Stands** (persistent public_global / public_community / private communities) replace the single global room. The hierarchy is stand → match → chat, and each `(stand, match)` pair has its own chat and viewer count.
  - **Predictions are in MVP**: pre-match picks, in-match flash picks scoped per `(stand, match)`, and a Predict tab.
  - Chat is **ephemeral**, with no history or replay in MVP.
  - The data provider for MVP is a **self-built mock API that matches OpenFootAPI's contract exactly**, including the `meta.access` quota block and `plan_upgrade_required` errors. Switching to the real API should be a config change.
  - Still open: the cold-start strategy (single club vs. marquee event).
- `docs/ui-brief.md` §4–7 are **stale** because they were written for the old one-room model. §1–3 (stack, design direction, tokens) still apply.
- `docs/technical-architecture.md` holds the target backend: Supabase with RLS, reads going directly from the browser, writes through server actions with `zod`, Realtime Broadcast for chat, and an always-on ingestion worker behind a provider adapter. The milestone build sequence is in §16.
