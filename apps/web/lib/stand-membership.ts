const STORAGE_KEY = "ff-stand-overrides";
const listeners = new Set<() => void>();

/**
 * Join/leave for a Stand is client-only (no backend), so we store only the
 * deltas from each fixture's static `joined` default, keyed by stand id —
 * same shape as club selection in `current-user.ts`.
 */
export function getStandOverrides(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function toggleStandJoined(standId: string, currentlyJoined: boolean) {
  if (typeof window === "undefined") return;
  const overrides = getStandOverrides();
  overrides[standId] = !currentlyJoined;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  listeners.forEach((listener) => listener());
}

export function subscribeToStandChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
