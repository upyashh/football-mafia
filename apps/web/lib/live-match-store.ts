import {
  getLiveMatchState,
  type LiveMatchState,
} from "@football-mafia/mock-data";

const TICK_MS = 1000;

type Entry = {
  state: LiveMatchState | null;
  listeners: Set<() => void>;
  interval: ReturnType<typeof setInterval> | null;
  /** Set once we've confirmed matchId isn't a simulated live match — never ticks. */
  irrelevant: boolean;
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

  if (next.status === "FINISHED" && entry.interval) {
    clearInterval(entry.interval);
    entry.interval = null;
  }
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
