import { kv } from "@/lib/kv";

function key(matchId: string) {
  return `kickoff:${matchId}`;
}

/**
 * Shared kickoff anchor for a simulated live match, stored in `kv` so every
 * serverless instance (and every browser/device) agrees on the same elapsed
 * minute instead of each one inventing its own "now" the first time it's asked.
 */
export async function getMatchKickoff(matchId: string): Promise<string> {
  const existing = await kv.get<string>(key(matchId));
  if (existing) return existing;

  const kickoff = new Date().toISOString();
  await kv.set(key(matchId), kickoff);
  return kickoff;
}

/** Testing-only: restarts a match's shared clock from now, for every client. */
export async function resetMatchKickoff(matchId: string): Promise<string> {
  const kickoff = new Date().toISOString();
  await kv.set(key(matchId), kickoff);
  return kickoff;
}
