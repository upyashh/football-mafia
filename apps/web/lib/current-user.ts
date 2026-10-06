import { currentUser as defaultUser } from "@football-mafia/mock-data";

const SESSION_KEY = "ff-session-user";
const listeners = new Set<() => void>();

type SessionUser = { id: string; username: string; clubId: string };

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

/** A fresh, never-seen-before mock identity — one per browser tab. */
function createIdentity(): SessionUser {
  const suffix = randomSuffix();
  return {
    id: `user-${suffix}`,
    username: `fan_${suffix}`,
    clubId: defaultUser.clubId,
  };
}

function readSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function writeSessionUser(user: SessionUser) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * The prototype's mock "signed in" user, scoped to `sessionStorage` instead
 * of `localStorage` — each browser tab gets its own generated identity, so
 * opening the app in two tabs is enough to test real-time chat as two
 * different mock users locally, without a real auth backend.
 */
export function getSessionUser(): SessionUser {
  if (typeof window === "undefined") return { ...defaultUser };
  const existing = readSessionUser();
  if (existing) return existing;
  const created = createIdentity();
  writeSessionUser(created);
  return created;
}

export function getSelectedClubId(): string {
  if (typeof window === "undefined") return defaultUser.clubId;
  return getSessionUser().clubId;
}

export function setSelectedClubId(clubId: string) {
  if (typeof window === "undefined") return;
  const user = getSessionUser();
  writeSessionUser({ ...user, clubId });
  listeners.forEach((listener) => listener());
}

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  return readSessionUser() !== null;
}

/** Clears this tab's mock identity so onboarding shows again from scratch. */
export function resetOnboarding() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
  listeners.forEach((listener) => listener());
}

export function subscribeToClubChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCurrentUsername(): string {
  return getSessionUser().username;
}
