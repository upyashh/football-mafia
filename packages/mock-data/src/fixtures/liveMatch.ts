import type { ChatMessage, Match, MatchEvent } from "../types";

/**
 * The one simulated "live" match for the prototype. kickoffAt is computed at
 * module load (app start / dev-server restart) so every fresh session sees
 * the match kick off at minute 0 — no persistence needed for a mock.
 */
export const LIVE_MATCH_ID = "match-live-1";

export const liveMatch: Match = {
  id: LIVE_MATCH_ID,
  competitionId: "comp-ucl",
  homeTeamId: "team-mun",
  awayTeamId: "team-atm",
  kickoffAt: new Date().toISOString(),
  status: "LIVE",
  homeScore: 0,
  awayScore: 0,
};

/** Deterministic minute-by-minute script — same run every session, for a repeatable demo. */
export const liveMatchEvents: MatchEvent[] = [
  { id: "lme-1", matchId: LIVE_MATCH_ID, minute: 0, type: "KICKOFF" },
  {
    id: "lme-2",
    matchId: LIVE_MATCH_ID,
    minute: 14,
    type: "GOAL",
    teamId: "team-mun",
    playerName: "B. Fernandes",
  },
  {
    id: "lme-3",
    matchId: LIVE_MATCH_ID,
    minute: 33,
    type: "CARD_YELLOW",
    teamId: "team-atm",
    playerName: "K. Koke",
  },
  { id: "lme-4", matchId: LIVE_MATCH_ID, minute: 45, type: "HALFTIME" },
  { id: "lme-5", matchId: LIVE_MATCH_ID, minute: 46, type: "KICKOFF" },
  {
    id: "lme-6",
    matchId: LIVE_MATCH_ID,
    minute: 67,
    type: "GOAL",
    teamId: "team-atm",
    playerName: "A. Griezmann",
  },
  {
    id: "lme-7",
    matchId: LIVE_MATCH_ID,
    minute: 81,
    type: "CARD_RED",
    teamId: "team-mun",
    playerName: "L. Shaw",
  },
  { id: "lme-8", matchId: LIVE_MATCH_ID, minute: 90, type: "FULLTIME" },
];

/**
 * Deterministic chat script for the same match — mock fans reacting to the
 * script above, interleaved by minute in the chat room. Same repeatability
 * rationale as liveMatchEvents.
 */
export const liveMatchChatMessages: ChatMessage[] = [
  {
    id: "lmc-1",
    matchId: LIVE_MATCH_ID,
    minute: 0,
    authorId: "user-mock-1",
    authorUsername: "reddevil_since96",
    authorClubId: "club-mun",
    body: "here we go, don't let me down today",
  },
  {
    id: "lmc-2",
    matchId: LIVE_MATCH_ID,
    minute: 1,
    authorId: "user-mock-2",
    authorUsername: "atletifan",
    authorClubId: "club-atm",
    body: "cholismo activated",
  },
  {
    id: "lmc-3",
    matchId: LIVE_MATCH_ID,
    minute: 14,
    authorId: "user-mock-1",
    authorUsername: "reddevil_since96",
    authorClubId: "club-mun",
    body: "BRUNOOOO",
  },
  {
    id: "lmc-4",
    matchId: LIVE_MATCH_ID,
    minute: 15,
    authorId: "user-mock-3",
    authorUsername: "neutral_groundhopper",
    authorClubId: "club-liv",
    body: "class finish that",
  },
  {
    id: "lmc-5",
    matchId: LIVE_MATCH_ID,
    minute: 33,
    authorId: "user-mock-2",
    authorUsername: "atletifan",
    authorClubId: "club-atm",
    body: "ref's been booking everything today",
  },
  {
    id: "lmc-6",
    matchId: LIVE_MATCH_ID,
    minute: 45,
    authorId: "user-mock-3",
    authorUsername: "neutral_groundhopper",
    authorClubId: "club-liv",
    body: "tight half, 1-0 feels fair",
  },
  {
    id: "lmc-7",
    matchId: LIVE_MATCH_ID,
    minute: 46,
    authorId: "user-mock-2",
    authorUsername: "atletifan",
    authorClubId: "club-atm",
    body: "second half comeback loading",
  },
  {
    id: "lmc-8",
    matchId: LIVE_MATCH_ID,
    minute: 67,
    authorId: "user-mock-2",
    authorUsername: "atletifan",
    authorClubId: "club-atm",
    body: "GRIEZMANN. GET IN.",
  },
  {
    id: "lmc-9",
    matchId: LIVE_MATCH_ID,
    minute: 68,
    authorId: "user-mock-1",
    authorUsername: "reddevil_since96",
    authorClubId: "club-mun",
    body: "why do we always do this to ourselves",
  },
  {
    id: "lmc-10",
    matchId: LIVE_MATCH_ID,
    minute: 81,
    authorId: "user-mock-3",
    authorUsername: "neutral_groundhopper",
    authorClubId: "club-liv",
    body: "that's a straight red, no complaints",
  },
  {
    id: "lmc-11",
    matchId: LIVE_MATCH_ID,
    minute: 90,
    authorId: "user-mock-2",
    authorUsername: "atletifan",
    authorClubId: "club-atm",
    body: "gg, deserved point on the balance of the game",
  },
];
