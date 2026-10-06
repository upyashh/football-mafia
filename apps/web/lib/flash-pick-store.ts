import type { FlashPickOption } from "./flash-pick";

const STORAGE_KEY = "ff-flash-picks";
const listeners = new Set<() => void>();

function pickKey(matchId: string, standId: string, windowIndex: number) {
  return `${matchId}:${standId}:${windowIndex}`;
}

function readAll(): Record<string, FlashPickOption> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, FlashPickOption>;
  } catch {
    return {};
  }
}

export function getFlashPick(
  matchId: string,
  standId: string,
  windowIndex: number,
): FlashPickOption | null {
  return readAll()[pickKey(matchId, standId, windowIndex)] ?? null;
}

/** No-op if the window is already locked — a flash pick can't change after it closes. */
export function submitFlashPick(
  matchId: string,
  standId: string,
  windowIndex: number,
  option: FlashPickOption,
  locked: boolean,
) {
  if (typeof window === "undefined" || locked) return;
  const all = readAll();
  all[pickKey(matchId, standId, windowIndex)] = option;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  listeners.forEach((listener) => listener());
}

export function subscribeToFlashPicks(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
