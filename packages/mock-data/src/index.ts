import { competitions } from "./fixtures/competitions";
import { clubs } from "./fixtures/clubs";
import { teams } from "./fixtures/teams";
import { players } from "./fixtures/players";
import { matches } from "./fixtures/matches";
import { matchStats } from "./fixtures/matchStats";
import { lineups } from "./fixtures/lineups";
import { feedPosts } from "./fixtures/feedPosts";
import { matchLogs } from "./fixtures/matchLogs";
import { currentUser } from "./fixtures/users";
import {
  liveMatch,
  liveMatchEvents,
  liveMatchChatMessages,
} from "./fixtures/liveMatch";
import { resolveLiveMatchState } from "./live-match";

export * from "./types";
export * from "./live-match";

// Synchronous exports for cross-cutting concerns (e.g. client-side theming)
// that can't wait on a promise before first paint. Data-fetching call sites
// should prefer the async getters below.
export { clubs } from "./fixtures/clubs";
export { competitions } from "./fixtures/competitions";
export { currentUser } from "./fixtures/users";

/** Sync lookup: a match's homeTeamId/awayTeamId -> the Club that team represents. */
export function getClubForTeamId(teamId: string) {
  const team = teams.find((t) => t.id === teamId);
  if (!team) return null;
  return clubs.find((c) => c.id === team.clubId) ?? null;
}

// Modeled as async so swapping these for real API/Supabase calls later
// is a body-only change, not a call-site change.

export async function getCompetitions() {
  return competitions;
}

export async function getClubs() {
  return clubs;
}

export async function getClubById(clubId: string) {
  return clubs.find((c) => c.id === clubId) ?? null;
}

export async function getTeamById(teamId: string) {
  return teams.find((t) => t.id === teamId) ?? null;
}

export async function getPastMatches() {
  return [...matches].sort(
    (a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime(),
  );
}

export async function getLiveMatches() {
  return [liveMatch];
}

export async function getMatchById(matchId: string) {
  if (matchId === liveMatch.id) return liveMatch;
  return matches.find((m) => m.id === matchId) ?? null;
}

export async function getMatchEvents(matchId: string) {
  if (matchId === liveMatch.id) return liveMatchEvents;
  return [];
}

export async function getLiveMatchState(matchId: string) {
  if (matchId !== liveMatch.id) return null;
  return resolveLiveMatchState(
    liveMatch,
    liveMatchEvents,
    new Date(),
    liveMatchChatMessages,
  );
}

/** Full scripted chat for the simulated live match — the live-match store reveals it by minute. */
export async function getChatMessages(matchId: string) {
  if (matchId === liveMatch.id) return liveMatchChatMessages;
  return [];
}

export async function getMatchStats(matchId: string) {
  return matchStats.find((s) => s.matchId === matchId) ?? null;
}

export async function getLineups(matchId: string) {
  return lineups.filter((l) => l.matchId === matchId);
}

export async function getPlayersByIds(playerIds: string[]) {
  const idSet = new Set(playerIds);
  return players.filter((p) => idSet.has(p.id));
}

export async function getFeedPosts(clubId: string) {
  return feedPosts
    .filter((p) => p.clubId === clubId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getMatchLogs(userId: string) {
  return matchLogs
    .filter((l) => l.userId === userId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getCurrentUser() {
  return currentUser;
}
