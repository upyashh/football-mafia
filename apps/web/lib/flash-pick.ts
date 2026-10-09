import type { MatchEvent, MatchStatus } from "@football-mafia/mock-data";

export const FLASH_PICK_WINDOW_MINUTES = 5;

export type FlashPickOption = "GOAL" | "CARD" | "QUIET";

export const FLASH_PICK_OPTIONS: FlashPickOption[] = ["GOAL", "CARD", "QUIET"];

export const FLASH_PICK_LABELS: Record<FlashPickOption, string> = {
  GOAL: "Goal",
  CARD: "Card",
  QUIET: "Quiet",
};

export type FlashPickWindow = {
  index: number;
  startMinute: number;
  endMinute: number;
};

export function getWindowForMinute(minute: number): FlashPickWindow {
  const index = Math.floor(minute / FLASH_PICK_WINDOW_MINUTES);
  const startMinute = index * FLASH_PICK_WINDOW_MINUTES;
  return { index, startMinute, endMinute: startMinute + FLASH_PICK_WINDOW_MINUTES };
}

export function getPreviousWindow(minute: number): FlashPickWindow | null {
  const current = getWindowForMinute(minute);
  if (current.index === 0) return null;
  return getWindowForMinute(current.startMinute - 1);
}

/** null = window hasn't fully elapsed yet (still open). */
export function resolveWindowOutcome(
  events: MatchEvent[],
  window: FlashPickWindow,
  matchStatus: MatchStatus,
  currentMinute: number,
): FlashPickOption | null {
  const elapsed = currentMinute >= window.endMinute || matchStatus === "FINISHED";
  if (!elapsed) return null;

  const inWindow = events.filter(
    (event) => event.minute >= window.startMinute && event.minute < window.endMinute,
  );
  if (inWindow.some((event) => event.type === "GOAL")) return "GOAL";
  if (inWindow.some((event) => event.type === "CARD_YELLOW" || event.type === "CARD_RED")) {
    return "CARD";
  }
  return "QUIET";
}

export function isWindowLocked(
  window: FlashPickWindow,
  matchStatus: MatchStatus,
  currentMinute: number,
): boolean {
  return currentMinute >= window.endMinute || matchStatus === "FINISHED";
}

function hashKey(key: string): number {
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

/** Deterministic mock % breakdown + pool size for a room's pick window — cosmetic only. */
export function mockPickBreakdown(
  standId: string,
  matchId: string,
  window: FlashPickWindow,
  userPick?: FlashPickOption | null,
): { option: FlashPickOption; pct: number }[] {
  const hash = hashKey(`${standId}:${matchId}:${window.index}`);
  const raw = FLASH_PICK_OPTIONS.map(
    (option, i) => 10 + ((hash >>> (i * 6)) % 70),
  );
  if (userPick) {
    raw[FLASH_PICK_OPTIONS.indexOf(userPick)] += 15;
  }
  const total = raw.reduce((sum, n) => sum + n, 0);
  const pct = raw.map((n) => Math.round((n / total) * 100));
  const drift = 100 - pct.reduce((sum, n) => sum + n, 0);
  pct[0] += drift;
  return FLASH_PICK_OPTIONS.map((option, i) => ({ option, pct: pct[i] }));
}

export function mockPickPoolSize(standId: string, matchId: string, window: FlashPickWindow) {
  const hash = hashKey(`pool:${standId}:${matchId}:${window.index}`);
  return 150 + (hash % 1850);
}
