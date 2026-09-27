# UI Implementation Brief — for Claude Code
## Live Football Social Platform — MVP screens (v1.0)

> ⚠️ **STALE as of 2026-09-19 — do not build screens directly from this doc yet.** The room model changed from "one global chat room per match" to **Stands** (persistent public/private communities, stand→match→chat) and predictions/flash-picks are now a live open question for MVP inclusion — see `decisions.md` and `prd.md` §8.3/§12. This brief's screen specs (§5), component inventory (§4), and "explicitly out of scope" list (§6) are all written against the old model and need a rewrite: a Stands directory/switcher screen, a redesigned match-chat screen scoped per-Stand, and a decision on whether a Predict tab/flash-pick widget belongs here. Section 1–3 (stack, design direction, tokens) still hold and don't need to change. Rewrite §4–7 once the remaining Stitch screens (Stands switcher, Predict) exist.

**How to use this doc:** Give this whole file to Claude Code as context, then ask it to scaffold the Next.js project and build the components/screens below in the build order in Section 7. This is scoped strictly to the MVP (PRD Section 8) — do not build predictions, private rooms, fan mood, or fantasy UI from this brief.

---

## 1. Stack & project setup

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui as the base primitive library (button, tabs, input, avatar, badge) — customize on top, don't ship shadcn's default look as-is
- **Icons:** lucide-react
- **State (MVP, no backend wiring yet):** local mock data + React state; structure components so real-time data (Supabase Realtime, per the PRD) can be dropped in later without a rewrite — i.e., chat messages and live score should be props/state driven by a single source, not hardcoded inline in JSX.
- **Mobile-first.** This is a phone-in-hand, matchday-companion product. Design and build for a 390–430px viewport first; tablet/desktop is a stretch goal, not a target for MVP.

---

## 2. Design direction (the "feel" to build toward)

Two reference patterns to blend — describe these to Claude Code explicitly, don't just say "sports app" or "chat app":

**A. Sports-utility density (score cards)**
Live score cards in this genre (MatchDay-style sports UI kits, FotMob/SofaScore-style layouts) share a consistent pattern: a compact card with team identity on the left/right edges, score large and centered, a small "LIVE" pill with the current minute in an accent color (usually red/green), and a thin progress or status indicator. Information density is high but never cramped — achieved through consistent alignment (everything on a shared baseline grid) rather than whitespace. **Apply this pattern to:** the fixture cards on Home and the score header on the Match page.

**B. Chat-native darkness (message stream)**
Dark-mode-first chat UIs (the dominant pattern in messaging apps generally) use a near-black background, message bubbles that are only subtly lighter than the background (not high-contrast cards), grouped consecutive messages from the same sender with the avatar/name shown once, and timestamps that fade into the background until hovered/tapped. **Apply this pattern to:** the live match room / Chat tab — this should feel like a message stream you're already used to, not a novel widget.

**The blend:** the app should feel like a sports utility that happens to have an excellent chat inside it, not a chat app with a scoreboard bolted on. Score/stats surfaces stay light-density-but-structured; the chat surface goes dark and message-native. It's fine — expected, even — for the Match page to visually shift character between its Stats/Lineups tabs (utility feel) and its Chat tab (message-stream feel), because that shift itself signals "this tab is different, this is where the people are."

**Club color theming:** every user has a club/country affiliation (mandatory at signup, per the PRD). That club's primary color becomes an accent color used for: the user's own message bubbles in chat, profile accents, and the "your club" fixture cards on Home. Do NOT use official crests/logos — use color + team name only (legal constraint from the PRD, Section 11). Build the color system as a token that swaps per-user, not hardcoded per-club — e.g. a `--club-accent` CSS variable set from the user's profile, not sixty duplicated component variants.

**General tone:** energetic but not cluttered. No gradients-for-decoration. Motion should be reserved for things that are actually live (a pulsing "LIVE" dot, a new message sliding in, a goal marker animating in) — not for generic UI chrome.

---

## 3. Design tokens

Give Claude Code this as a starting Tailwind config / CSS variable set — treat as a first draft, not final:

```css
:root {
  /* Neutral surfaces — utility screens (Home, Stats, Lineups) */
  --surface-page: #F7F7F5;
  --surface-card: #FFFFFF;
  --border-subtle: #E5E5E2;
  --text-primary: #1A1A18;
  --text-secondary: #6B6B66;

  /* Chat surface — dark, message-native */
  --chat-bg: #14151A;
  --chat-bubble-other: #1F212A;
  --chat-bubble-mine: var(--club-accent);
  --chat-text: #EDEDF0;
  --chat-text-secondary: #8A8B93;

  /* Status */
  --live-accent: #E23B3B;      /* the LIVE pill + pulsing dot */
  --event-goal: #22A559;       /* goal marker highlight */
  --event-card-yellow: #E8B800;
  --event-card-red: #E23B3B;

  /* Per-user club accent — set at runtime from profile, this is just a fallback */
  --club-accent: #2E6BE0;
}

/* Dark mode variant of the utility surfaces — chat stays dark either way */
[data-theme="dark"] {
  --surface-page: #101114;
  --surface-card: #1A1B20;
  --border-subtle: #2A2B30;
  --text-primary: #F0F0EE;
  --text-secondary: #9A9B9C;
}
```

Typography: one sans-serif family throughout (system font stack is fine — don't import a display font for a utility app). Two weights only: regular (400) for body/secondary, medium (500–600) for scores, titles, and the sender name in chat. Numbers (scores, clocks, minute counters) should use a tabular/monospaced numeral variant if the chosen font supports it, so scores don't jitter as digits change.

Spacing: 4px base unit (Tailwind default scale is fine — 1,2,3,4,6,8...). Card padding 16px. Card corner radius 12px for utility cards, 16–20px for chat bubbles (bubbles read friendlier with more rounding).

---

## 4. Component inventory

Build these as standalone, reusable components before assembling screens:

| Component | Notes |
|---|---|
| `FixtureCard` | Team names, live score or kickoff time, competition tag, LIVE pill with pulsing dot + minute when live. Tappable → navigates to match page. |
| `ScoreHeader` | Sticky header on the match page: both team names/colors, score, clock/status. Persists across all three tabs (Stats/Lineups/Chat) so context never disappears. |
| `MatchTabBar` | Stats / Lineups / Chat segmented control. Chat is visually the "home" tab for a live match — see Section 5. |
| `ChatMessage` | Sender avatar + name (shown once per consecutive group), message text, timestamp (faded, shown on tap). Own messages align right and use `--chat-bubble-mine` (the user's club accent); others align left and use `--chat-bubble-other`. |
| `EventMarker` | Inline, full-width element inside the chat stream (not a message bubble) for goal/card/sub events. Visually distinct from messages — e.g. centered, icon + short label, colored per event type (`--event-goal`, `--event-card-yellow/red`). This is the single most important visual distinction in the whole app: a marker must never be mistaken for a user message. |
| `ReactionBar` | Row of quick-tap emoji reactions above the message input. |
| `MessageInput` | Bottom-fixed text input + send button, sits above the reaction bar. |
| `LiveParticipantCount` | Small pill, e.g. "2.4k watching" — sits near the score header on the Chat tab only. |
| `ClubBadge` | Colored chip/avatar-ring using team color, no crest. Used on profile, feed posts, and chat sender avatars. |
| `FeedPost` | Text + optional single image, like/comment counts, author's `ClubBadge`. |
| `BottomNav` | Feed / Matches / Profile, three-item tab bar, persistent across the app (not shown on the Match page — that page is a focused, full-screen context). |
| `MatchLogPrompt` | One-tap "I watched this" + optional star rating, shown on the match page after full-time. |

---

## 5. Screen specs

### 5.1 Home (Feed tab)
- Top section: horizontally scrollable row of `FixtureCard`s (today's live + upcoming fixtures, top leagues only)
- Below: vertical, chronological feed of `FeedPost`s from the user's club community — explicitly NOT algorithmically ranked
- `BottomNav` pinned at the bottom: Feed (active) | Matches | Profile

### 5.2 Match page — the core screen
- `ScoreHeader` pinned at top, persists across tab switches
- `MatchTabBar`: Stats | Lineups | **Chat** — **Chat is the default/initial tab when the match is live**; Stats is the default when the match hasn't started or has ended and the room has gone quiet. (Flag this rule explicitly to Claude Code — it's a real product decision, not a visual default.)
- **Chat tab (build this first, most effort here):**
  - `LiveParticipantCount` just under the score header
  - Scrollable message stream: `ChatMessage`s and `EventMarker`s interleaved in true chronological order — an `EventMarker` for a goal must appear in the exact position in the scroll where it happened, not in a separate pinned area
  - `ReactionBar` + `MessageInput` fixed at the bottom
  - No `BottomNav` on this screen — full-bleed, focused
- **Stats tab:** standard stat rows (possession, shots, cards) — lower design priority, keep it clean but don't over-invest here for MVP
- **Lineups tab:** starting XI as a simple formation-shaped list or pitch diagram — lower design priority
- After full-time, show `MatchLogPrompt` — either as a bottom sheet on first visit post-match, or inline at the top of the Chat tab once the match has ended

### 5.3 Profile
- `ClubBadge` + username
- Match log: grid or list of logged matches with ratings (Letterboxd-diary style — this is a personal record, should feel satisfying to scroll even with only a handful of entries)

### 5.4 Onboarding (build last, it's simple)
- Sign up form → mandatory club/country picker (searchable list, single-select, sets `--club-accent` immediately on selection so the rest of the app already feels "theirs" from the first screen after)

---

## 6. Explicitly out of scope for this pass

Do not build UI for: predictions/betting-style widgets, fan mood indicators, private/invite-only rooms, DMs, FPL integration, player-rating aggregation, rivalry rooms, badges/streaks beyond the basic match log. These are Phase 2/3 per the PRD — building their UI now creates screens that don't match validated flows yet.

---

## 7. Build order (suggested prompt sequence for Claude Code)

1. Scaffold Next.js + Tailwind + shadcn/ui, wire up the design tokens in Section 3 as CSS variables + `tailwind.config`.
2. Build `ChatMessage`, `EventMarker`, `ReactionBar`, `MessageInput` in isolation with mock data — this is the highest-risk, highest-value component set, get it right before anything else.
3. Assemble the Chat tab screen using those components with a mock live match transcript (include at least one goal event mid-stream to verify the marker doesn't get mistaken for a message).
4. Build `ScoreHeader` + `MatchTabBar`, wire the Chat tab in, stub Stats/Lineups as placeholder screens.
5. Build `FixtureCard`, `FeedPost`, `BottomNav`, assemble Home.
6. Build `ClubBadge`, Profile screen, `MatchLogPrompt`.
7. Build onboarding + club picker last, wire `--club-accent` to actually propagate through the app on selection.

Ask Claude Code to pause after step 3 for a visual check before continuing — that's the screen where the "sports utility vs. chat-native" blend either works or doesn't, and it's cheap to fix at that point and expensive to fix after five more screens are built on the same wrong assumption.
