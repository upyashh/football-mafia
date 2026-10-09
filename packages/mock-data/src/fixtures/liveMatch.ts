import type { ChatMessage, Match, MatchEvent } from "../types";

/**
 * Simulated "live" matches for the prototype. Each kickoffAt is computed at
 * module load (app start / dev-server restart) so every fresh session sees
 * the same scripted progression from minute 0 — no persistence needed for a
 * mock. Multiple concurrent live scripts exist on purpose — the Home feed
 * needs to show more than one match live at once.
 */
export type LiveScript = {
  match: Match;
  events: MatchEvent[];
  chatMessages: ChatMessage[];
};

export const LIVE_MATCH_ID = "match-live-1";
const LIVE_MATCH_2_ID = "match-live-2";

const liveScripts: LiveScript[] = [
  {
    match: {
      id: LIVE_MATCH_ID,
      competitionId: "comp-ucl",
      homeTeamId: "team-mun",
      awayTeamId: "team-atm",
      kickoffAt: new Date().toISOString(),
      status: "LIVE",
      homeScore: 0,
      awayScore: 0,
    },
    events: [
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
    ],
    chatMessages: [
      {
        id: "lmc-1",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 0,
        authorId: "user-mock-1",
        authorUsername: "reddevil_since96",
        authorClubId: "club-mun",
        body: "here we go, don't let me down today",
      },
      {
        id: "lmc-2",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 1,
        authorId: "user-mock-2",
        authorUsername: "atletifan",
        authorClubId: "club-atm",
        body: "cholismo activated",
      },
      {
        id: "lmc-3",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 14,
        authorId: "user-mock-1",
        authorUsername: "reddevil_since96",
        authorClubId: "club-mun",
        body: "BRUNOOOO",
      },
      {
        id: "lmc-4",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 15,
        authorId: "user-mock-3",
        authorUsername: "neutral_groundhopper",
        authorClubId: "club-liv",
        body: "class finish that",
      },
      {
        id: "lmc-5",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 33,
        authorId: "user-mock-2",
        authorUsername: "atletifan",
        authorClubId: "club-atm",
        body: "ref's been booking everything today",
      },
      {
        id: "lmc-6",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 45,
        authorId: "user-mock-3",
        authorUsername: "neutral_groundhopper",
        authorClubId: "club-liv",
        body: "tight half, 1-0 feels fair",
      },
      {
        id: "lmc-7",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 46,
        authorId: "user-mock-2",
        authorUsername: "atletifan",
        authorClubId: "club-atm",
        body: "second half comeback loading",
      },
      {
        id: "lmc-8",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 67,
        authorId: "user-mock-2",
        authorUsername: "atletifan",
        authorClubId: "club-atm",
        body: "GRIEZMANN. GET IN.",
      },
      {
        id: "lmc-9",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 68,
        authorId: "user-mock-1",
        authorUsername: "reddevil_since96",
        authorClubId: "club-mun",
        body: "why do we always do this to ourselves",
      },
      {
        id: "lmc-10",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 81,
        authorId: "user-mock-3",
        authorUsername: "neutral_groundhopper",
        authorClubId: "club-liv",
        body: "that's a straight red, no complaints",
      },
      {
        id: "lmc-11",
        matchId: LIVE_MATCH_ID,
        standId: "stand-global-terrace",
        minute: 90,
        authorId: "user-mock-2",
        authorUsername: "atletifan",
        authorClubId: "club-atm",
        body: "gg, deserved point on the balance of the game",
      },
    ],
  },
  {
    match: {
      id: LIVE_MATCH_2_ID,
      competitionId: "comp-pl",
      homeTeamId: "team-ars",
      awayTeamId: "team-mci",
      kickoffAt: new Date(Date.now() - 6 * 1500).toISOString(),
      status: "LIVE",
      homeScore: 0,
      awayScore: 0,
    },
    events: [
      { id: "lme2-1", matchId: LIVE_MATCH_2_ID, minute: 0, type: "KICKOFF" },
      {
        id: "lme2-2",
        matchId: LIVE_MATCH_2_ID,
        minute: 9,
        type: "GOAL",
        teamId: "team-ars",
        playerName: "B. Saka",
      },
      {
        id: "lme2-3",
        matchId: LIVE_MATCH_2_ID,
        minute: 28,
        type: "CARD_YELLOW",
        teamId: "team-mci",
        playerName: "R. Gvardiol",
      },
      { id: "lme2-4", matchId: LIVE_MATCH_2_ID, minute: 45, type: "HALFTIME" },
      { id: "lme2-5", matchId: LIVE_MATCH_2_ID, minute: 46, type: "KICKOFF" },
      {
        id: "lme2-6",
        matchId: LIVE_MATCH_2_ID,
        minute: 61,
        type: "GOAL",
        teamId: "team-mci",
        playerName: "P. Foden",
      },
      { id: "lme2-7", matchId: LIVE_MATCH_2_ID, minute: 90, type: "FULLTIME" },
    ],
    chatMessages: [
      {
        id: "lmc2-1",
        matchId: LIVE_MATCH_2_ID,
        standId: "stand-global-terrace",
        minute: 0,
        authorId: "user-mock-4",
        authorUsername: "gunner4life",
        authorClubId: "club-ars",
        body: "north london's alright today, let's have it",
      },
      {
        id: "lmc2-2",
        matchId: LIVE_MATCH_2_ID,
        standId: "stand-global-terrace",
        minute: 9,
        authorId: "user-mock-4",
        authorUsername: "gunner4life",
        authorClubId: "club-ars",
        body: "SAKAAAA",
      },
      {
        id: "lmc2-3",
        matchId: LIVE_MATCH_2_ID,
        standId: "stand-global-terrace",
        minute: 61,
        authorId: "user-mock-5",
        authorUsername: "citizen_blue",
        authorClubId: "club-mci",
        body: "Foden pulling us level, get in",
      },
    ],
  },
];

export function findLiveScript(matchId: string): LiveScript | undefined {
  return liveScripts.find((script) => script.match.id === matchId);
}

export function allLiveScripts(): LiveScript[] {
  return liveScripts;
}

/**
 * Overrides a simulated live match's kickoff time in place. The caller
 * (apps/web's live-match-store) persists the chosen anchor in localStorage
 * so a browser refresh doesn't recompute `new Date()` and snap the match
 * back to minute 0 — and uses the same setter to support an explicit
 * "reset to kickoff" action for testing.
 */
export function setLiveMatchKickoff(matchId: string, kickoffAt: string) {
  const script = findLiveScript(matchId);
  if (script) script.match.kickoffAt = kickoffAt;
}
