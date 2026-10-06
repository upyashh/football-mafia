const kickoffByMatch = new Map<string, string>();

/**
 * In-memory, per-server-process kickoff anchor for a simulated live match —
 * shared by every client that asks, so two browsers (or devices) watching
 * the same match compute the same elapsed minute instead of each starting
 * their own clock. Swappable for a real DB later, same as chat-store.
 */
export function getMatchKickoff(matchId: string): string {
  let kickoff = kickoffByMatch.get(matchId);
  if (!kickoff) {
    kickoff = new Date().toISOString();
    kickoffByMatch.set(matchId, kickoff);
  }
  return kickoff;
}

/** Testing-only: restarts a match's shared clock from now, for every client. */
export function resetMatchKickoff(matchId: string): string {
  const kickoff = new Date().toISOString();
  kickoffByMatch.set(matchId, kickoff);
  return kickoff;
}
