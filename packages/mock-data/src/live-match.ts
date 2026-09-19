import type { ChatMessage, Match, MatchEvent, MatchStatus } from "./types";

/** How many real ms represent one simulated match-minute. Tunable for demo pacing. */
export const SIM_MS_PER_MINUTE = 1500;

export type LiveMatchState = {
  status: MatchStatus;
  minute: number;
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  messages: ChatMessage[];
};

/**
 * Pure function of elapsed time: given the live match's kickoff + its scripted
 * events/chat, derive the current score/status/minute/events-and-messages-so-far.
 * This is the shape a real polling worker would eventually replace (body-only swap).
 */
export function resolveLiveMatchState(
  match: Match,
  script: MatchEvent[],
  now: Date,
  chatScript: ChatMessage[] = [],
): LiveMatchState {
  const elapsedMs = now.getTime() - new Date(match.kickoffAt).getTime();
  const elapsedMinutes = Math.floor(elapsedMs / SIM_MS_PER_MINUTE);

  let status: MatchStatus;
  let minute: number;

  if (elapsedMinutes < 0) {
    status = "SCHEDULED";
    minute = 0;
  } else if (elapsedMinutes < 45) {
    status = "LIVE";
    minute = elapsedMinutes;
  } else if (elapsedMinutes < 46) {
    status = "PAUSED";
    minute = 45;
  } else if (elapsedMinutes < 90) {
    status = "LIVE";
    minute = elapsedMinutes;
  } else {
    status = "FINISHED";
    minute = 90;
  }

  const events = script.filter((event) => event.minute <= minute);
  const homeScore = events.filter(
    (event) => event.type === "GOAL" && event.teamId === match.homeTeamId,
  ).length;
  const awayScore = events.filter(
    (event) => event.type === "GOAL" && event.teamId === match.awayTeamId,
  ).length;

  const messages = chatScript.filter((message) => message.minute <= minute);

  return { status, minute, homeScore, awayScore, events, messages };
}
