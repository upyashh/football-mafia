import {
  getLiveMatchState,
  setLiveMatchKickoff,
  type LiveMatchState,
} from "@football-mafia/mock-data";

const TICK_MS = 1000;
// How often we re-check the server's shared kickoff anchor, so a reset
// triggered from another browser/device shows up here too.
const KICKOFF_RESYNC_TICKS = 5;

/**
 * The simulated live-match fixture computes `kickoffAt: new Date()` at
 * module load — which happens again on every browser refresh/tab/device,
 * which would otherwise give everyone their own timeline. Instead we fetch
 * a single kickoff anchor from the server (shared across every client) and
 * apply it locally before ticking, so everyone watching a match sees the
 * same elapsed minute.
 */
async function syncKickoffFromServer(matchId: string) {
  try {
    const res = await fetch(`/api/matches/${matchId}/kickoff`, { cache: "no-store" });
    if (!res.ok) return;
    const { kickoffAt } = (await res.json()) as { kickoffAt: string };
    setLiveMatchKickoff(matchId, kickoffAt);
  } catch {
    // Offline or server hiccup — keep ticking with whatever anchor we have.
  }
}

type Entry = {
  state: LiveMatchState | null;
  listeners: Set<() => void>;
  interval: ReturnType<typeof setInterval> | null;
  /** Set once we've confirmed matchId isn't a simulated live match — never ticks. */
  irrelevant: boolean;
  tickCount: number;
};

const entries = new Map<string, Entry>();

function getEntry(matchId: string): Entry {
  let entry = entries.get(matchId);
  if (!entry) {
    entry = {
      state: null,
      listeners: new Set(),
      interval: null,
      irrelevant: false,
      tickCount: 0,
    };
    entries.set(matchId, entry);
  }
  return entry;
}

function hasChanged(a: LiveMatchState | null, b: LiveMatchState) {
  if (!a) return true;
  return (
    a.status !== b.status ||
    a.minute !== b.minute ||
    a.homeScore !== b.homeScore ||
    a.awayScore !== b.awayScore ||
    a.events.length !== b.events.length ||
    a.messages.length !== b.messages.length
  );
}

async function tick(matchId: string) {
  const entry = getEntry(matchId);
  // Once FINISHED the interval is torn down, so this match is otherwise only
  // re-checked when a tab regains visibility — always resync the kickoff
  // then (ignoring the throttle) so a reset-from-FT is never missed.
  if (entry.tickCount % KICKOFF_RESYNC_TICKS === 0 || entry.state?.status === "FINISHED") {
    await syncKickoffFromServer(matchId);
  }
  entry.tickCount += 1;

  const next = await getLiveMatchState(matchId);
  if (!next) {
    entry.irrelevant = true;
    if (entry.interval) {
      clearInterval(entry.interval);
      entry.interval = null;
    }
    return;
  }

  if (hasChanged(entry.state, next)) {
    entry.state = next;
    entry.listeners.forEach((listener) => listener());
  }

  if (next.status === "FINISHED") {
    if (entry.interval) {
      clearInterval(entry.interval);
      entry.interval = null;
    }
  } else if (!entry.interval) {
    // A reset brought a previously-FINISHED match back to LIVE — restart
    // the interval that FINISHED had torn down.
    entry.interval = setInterval(() => tick(matchId), TICK_MS);
  }
}

// Background tabs get their setInterval throttled by the browser (often to
// once a minute or less), so a tab you've switched away from won't notice a
// reset for a long time on its own. Force an immediate resync+tick for every
// match being watched as soon as the tab regains visibility/focus, so
// switching back to it catches you up right away instead of waiting on the
// throttled timer.
if (typeof document !== "undefined") {
  const resyncAllVisible = () => {
    if (document.visibilityState !== "visible") return;
    for (const [matchId, entry] of entries) {
      if (!entry.irrelevant) {
        tick(matchId);
      }
    }
  };
  document.addEventListener("visibilitychange", resyncAllVisible);
  window.addEventListener("focus", resyncAllVisible);
}

/** Lazily starts polling a live match's simulated state. Safe to call repeatedly. */
export function ensureTicking(matchId: string) {
  const entry = getEntry(matchId);
  if (entry.irrelevant || entry.interval || entry.state?.status === "FINISHED") {
    return;
  }

  tick(matchId);
  entry.interval = setInterval(() => tick(matchId), TICK_MS);
}

/**
 * Testing-only: restarts a simulated live match from kickoff (minute 0,
 * LIVE) for every client — resets the shared server-side anchor, not just
 * this browser's.
 */
export async function resetLiveMatchForTesting(matchId: string) {
  const res = await fetch(`/api/matches/${matchId}/kickoff`, { method: "POST" });
  const { kickoffAt } = (await res.json()) as { kickoffAt: string };
  setLiveMatchKickoff(matchId, kickoffAt);

  const entry = getEntry(matchId);
  entry.irrelevant = false;
  entry.tickCount = 0;
  if (entry.interval) {
    clearInterval(entry.interval);
    entry.interval = null;
  }
  entry.state = null;
  ensureTicking(matchId);
}

export function getLiveMatchSnapshot(matchId: string): LiveMatchState | null {
  return entries.get(matchId)?.state ?? null;
}

export function subscribeToLiveMatch(
  matchId: string,
  listener: () => void,
): () => void {
  const entry = getEntry(matchId);
  entry.listeners.add(listener);
  return () => entry.listeners.delete(listener);
}
