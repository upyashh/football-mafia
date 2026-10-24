import type { Match } from "../types";

export const matches: Match[] = [
  {
    id: "match-ars-mci",
    competitionId: "comp_premier_league_eng",
    homeTeamId: "team-arsenal",
    awayTeamId: "team-manchester-city",
    kickoffAt: "2026-09-06T15:00:00Z",
    status: "FINISHED",
    homeScore: 2,
    awayScore: 1,
  },
  {
    id: "match-liv-mun",
    competitionId: "comp_premier_league_eng",
    homeTeamId: "team-liverpool",
    awayTeamId: "team-manchester-united",
    kickoffAt: "2026-09-07T14:00:00Z",
    status: "FINISHED",
    homeScore: 3,
    awayScore: 1,
  },
  {
    id: "match-rma-fcb",
    competitionId: "comp_laliga_es",
    homeTeamId: "team-real-madrid",
    awayTeamId: "team-barcelona",
    kickoffAt: "2026-09-13T19:00:00Z",
    status: "FINISHED",
    homeScore: 2,
    awayScore: 2,
  },
  {
    id: "match-mci-liv",
    competitionId: "comp_premier_league_eng",
    homeTeamId: "team-manchester-city",
    awayTeamId: "team-liverpool",
    kickoffAt: "2026-08-30T15:00:00Z",
    status: "FINISHED",
    homeScore: 1,
    awayScore: 1,
  },
  {
    id: "match-atm-rma",
    competitionId: "comp_laliga_es",
    homeTeamId: "team-atl-tico-madrid",
    awayTeamId: "team-real-madrid",
    kickoffAt: "2026-08-31T20:00:00Z",
    status: "FINISHED",
    homeScore: 0,
    awayScore: 1,
  },
];

export const upcomingMatches: Match[] = [
  {
    id: "match-liv-mci-upcoming",
    competitionId: "comp_premier_league_eng",
    homeTeamId: "team-liverpool",
    awayTeamId: "team-manchester-city",
    kickoffAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    status: "SCHEDULED",
    homeScore: 0,
    awayScore: 0,
  },
];
