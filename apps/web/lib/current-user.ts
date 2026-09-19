import { currentUser } from "@football-mafia/mock-data";

const STORAGE_KEY = "ff-selected-club-id";
const listeners = new Set<() => void>();

/**
 * The prototype has one mock "signed in" user (see @football-mafia/mock-data).
 * Onboarding's club picker doesn't create a new identity — it just changes
 * which club that mock user is affiliated with, stored client-side so the
 * accent/feed react immediately without a backend.
 */
export function getSelectedClubId(): string {
  if (typeof window === "undefined") return currentUser.clubId;
  return window.localStorage.getItem(STORAGE_KEY) ?? currentUser.clubId;
}

export function setSelectedClubId(clubId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, clubId);
  listeners.forEach((listener) => listener());
}

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) !== null;
}

/** Clears the mock user's club choice so onboarding shows again from scratch. */
export function resetOnboarding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

export function subscribeToClubChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCurrentUsername(): string {
  return currentUser.username;
}
