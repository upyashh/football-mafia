import type { ProviderEvent, ProviderLineup, ProviderMatch } from "./contract-types";
import { SIM_MS_PER_MINUTE } from "./engine";

// Scripted match scenarios for the mock provider service. Live matches are anchored to
// module-load time (like the existing fixtures/liveMatch.ts) so they progress in real
// time via the engine's elapsed-minute simulation. Several concurrent live matches exist
// on purpose — the Stands-switcher needs to demonstrate choosing between simultaneously
// live matches.
//
// Kickoff offsets for "live" scenarios must be expressed in *simulated* match-minutes
// (via SIM_MS_PER_MINUTE), not real-world minutes/hours — SIM_MS_PER_MINUTE compresses a
// 90-minute match into ~135 real seconds, so an offset of real minutes/hours would land
// far past full-time. "scheduled"/"finished" scenarios aren't re-simulated (see engine.ts)
// so their kickoff offsets can use real time freely.

const now = () => new Date();
const simMinutesAgo = (mins: number) => new Date(now().getTime() - mins * SIM_MS_PER_MINUTE).toISOString();
const hoursFromNow = (hrs: number) => new Date(now().getTime() + hrs * 60 * 60 * 1000).toISOString();
const hoursAgo = (hrs: number) => new Date(now().getTime() - hrs * 60 * 60 * 1000).toISOString();

export type Scenario = {
  match: ProviderMatch;
  events: ProviderEvent[]; // full script, keyed by minute — engine filters by elapsed minute
  lineups: ProviderLineup[];
};

// Scenario A: live, kicked off ~14 sim-minutes ago (see engine.ts SIM_MS_PER_MINUTE) —
// mirrors the old fixtures/liveMatch.ts Man Utd vs Atletico script.
const scenarioLiveA: Scenario = {
  match: {
    id: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid",
    competitionId: "comp-ucl",
    homeTeam: { id: "team_manchester_united_gb", shortName: "MUN" },
    awayTeam: { id: "team_atletico_madrid_es", shortName: "ATM" },
    kickoffAt: simMinutesAgo(20),
    status: "live",
    score: { home: 0, away: 0 },
    minute: null,
    addedTime: null,
    period: null,
    sourceRefs: [{ id: "src_fotmob_4193490", source: "fotmob" }],
  },
  events: [
    { id: "ev-a-1", matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid", minute: 0, type: "kickoff", sourceRefs: [] },
    { id: "ev-a-2", matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid", minute: 14, type: "goal", teamId: "team_manchester_united_gb", playerName: "Bruno Fernandes", sourceRefs: [{ id: "src_fotmob_ev_1", source: "fotmob" }] },
    { id: "ev-a-3", matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid", minute: 33, type: "yellow_card", teamId: "team_atletico_madrid_es", playerName: "Koke", sourceRefs: [] },
    { id: "ev-a-4", matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid", minute: 45, type: "half_time", sourceRefs: [] },
    { id: "ev-a-5", matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid", minute: 46, type: "kickoff", sourceRefs: [] },
    { id: "ev-a-6", matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid", minute: 67, type: "goal", teamId: "team_atletico_madrid_es", playerName: "Antoine Griezmann", sourceRefs: [{ id: "src_fotmob_ev_2", source: "fotmob" }] },
    { id: "ev-a-7", matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid", minute: 81, type: "red_card", teamId: "team_manchester_united_gb", playerName: "Luke Shaw", sourceRefs: [] },
    { id: "ev-a-8", matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid", minute: 90, type: "full_time", sourceRefs: [] },
  ],
  lineups: [
    {
      matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid",
      teamId: "team_manchester_united_gb",
      formation: "4-2-3-1",
      startingXI: Array.from({ length: 11 }, (_, i) => ({ playerId: `team-mun-p${i + 1}`, playerName: `MUN Player ${i + 1}`, isStarting: true })),
    },
    {
      matchId: "match_mock_ucl_2026-27_20260919_manchester_united_atletico_madrid",
      teamId: "team_atletico_madrid_es",
      formation: "4-4-2",
      startingXI: Array.from({ length: 11 }, (_, i) => ({ playerId: `team-atm-p${i + 1}`, playerName: `ATM Player ${i + 1}`, isStarting: true })),
    },
  ],
};

// Scenario B: live, kicked off more recently — a second concurrent live match, distinct
// competition, so the Stands-switcher has two genuinely different live rooms to pick from.
const scenarioLiveB: Scenario = {
  match: {
    id: "match_mock_pl_2026-27_20260919_arsenal_liverpool",
    competitionId: "comp-pl",
    homeTeam: { id: "team_arsenal_gb", shortName: "ARS" },
    awayTeam: { id: "team_liverpool_gb", shortName: "LIV" },
    kickoffAt: simMinutesAgo(6),
    status: "live",
    score: { home: 0, away: 0 },
    minute: null,
    addedTime: null,
    period: null,
    sourceRefs: [{ id: "src_fotmob_4193501", source: "fotmob" }],
  },
  events: [
    { id: "ev-b-1", matchId: "match_mock_pl_2026-27_20260919_arsenal_liverpool", minute: 0, type: "kickoff", sourceRefs: [] },
    { id: "ev-b-2", matchId: "match_mock_pl_2026-27_20260919_arsenal_liverpool", minute: 9, type: "goal", teamId: "team_arsenal_gb", playerName: "Bukayo Saka", sourceRefs: [{ id: "src_fotmob_ev_3", source: "fotmob" }] },
    { id: "ev-b-3", matchId: "match_mock_pl_2026-27_20260919_arsenal_liverpool", minute: 28, type: "yellow_card", teamId: "team_liverpool_gb", playerName: "Alexis Mac Allister", sourceRefs: [] },
    { id: "ev-b-4", matchId: "match_mock_pl_2026-27_20260919_arsenal_liverpool", minute: 45, type: "half_time", sourceRefs: [] },
    { id: "ev-b-5", matchId: "match_mock_pl_2026-27_20260919_arsenal_liverpool", minute: 46, type: "kickoff", sourceRefs: [] },
    { id: "ev-b-6", matchId: "match_mock_pl_2026-27_20260919_arsenal_liverpool", minute: 61, type: "goal", teamId: "team_liverpool_gb", playerName: "Mohamed Salah", sourceRefs: [{ id: "src_fotmob_ev_4", source: "fotmob" }] },
    { id: "ev-b-7", matchId: "match_mock_pl_2026-27_20260919_arsenal_liverpool", minute: 90, type: "full_time", sourceRefs: [] },
  ],
  lineups: [
    {
      matchId: "match_mock_pl_2026-27_20260919_arsenal_liverpool",
      teamId: "team_arsenal_gb",
      formation: "4-3-3",
      startingXI: Array.from({ length: 11 }, (_, i) => ({ playerId: `team-ars-p${i + 1}`, playerName: `ARS Player ${i + 1}`, isStarting: true })),
    },
    {
      matchId: "match_mock_pl_2026-27_20260919_arsenal_liverpool",
      teamId: "team_liverpool_gb",
      formation: "4-3-3",
      startingXI: Array.from({ length: 11 }, (_, i) => ({ playerId: `team-liv-p${i + 1}`, playerName: `LIV Player ${i + 1}`, isStarting: true })),
    },
  ],
};

// Scenario C: scheduled, kicks off in 3 hours — exercises status=scheduled filtering.
const scenarioScheduled: Scenario = {
  match: {
    id: "match_mock_laliga_2026-27_20260920_real_madrid_barcelona",
    competitionId: "comp-laliga",
    homeTeam: { id: "team_real_madrid_es", shortName: "RMA" },
    awayTeam: { id: "team_barcelona_es", shortName: "FCB" },
    kickoffAt: hoursFromNow(3),
    status: "scheduled",
    score: { home: 0, away: 0 },
    minute: null,
    addedTime: null,
    period: null,
    sourceRefs: [{ id: "src_fotmob_4193512", source: "fotmob" }],
  },
  events: [],
  lineups: [],
};

// Scenario D: finished — exercises status=finished filtering and a completed event script.
const scenarioFinished: Scenario = {
  match: {
    id: "match_mock_pl_2026-27_20260918_manchester_city_liverpool",
    competitionId: "comp-pl",
    homeTeam: { id: "team_manchester_city_gb", shortName: "MCI" },
    awayTeam: { id: "team_liverpool_gb", shortName: "LIV" },
    kickoffAt: hoursAgo(24),
    status: "finished",
    score: { home: 2, away: 1 },
    minute: 90,
    addedTime: 3,
    period: "full_time",
    sourceRefs: [{ id: "src_fotmob_4193488", source: "fotmob" }],
  },
  events: [
    { id: "ev-d-1", matchId: "match_mock_pl_2026-27_20260918_manchester_city_liverpool", minute: 0, type: "kickoff", sourceRefs: [] },
    { id: "ev-d-2", matchId: "match_mock_pl_2026-27_20260918_manchester_city_liverpool", minute: 22, type: "goal", teamId: "team_manchester_city_gb", playerName: "Erling Haaland", sourceRefs: [] },
    { id: "ev-d-3", matchId: "match_mock_pl_2026-27_20260918_manchester_city_liverpool", minute: 45, type: "half_time", sourceRefs: [] },
    { id: "ev-d-4", matchId: "match_mock_pl_2026-27_20260918_manchester_city_liverpool", minute: 46, type: "kickoff", sourceRefs: [] },
    { id: "ev-d-5", matchId: "match_mock_pl_2026-27_20260918_manchester_city_liverpool", minute: 58, type: "goal", teamId: "team_liverpool_gb", playerName: "Mohamed Salah", sourceRefs: [] },
    { id: "ev-d-6", matchId: "match_mock_pl_2026-27_20260918_manchester_city_liverpool", minute: 84, type: "goal", teamId: "team_manchester_city_gb", playerName: "Phil Foden", sourceRefs: [] },
    { id: "ev-d-7", matchId: "match_mock_pl_2026-27_20260918_manchester_city_liverpool", minute: 90, type: "full_time", sourceRefs: [] },
  ],
  lineups: [],
};

export const scenarios: Scenario[] = [scenarioLiveA, scenarioLiveB, scenarioScheduled, scenarioFinished];

export function findScenario(matchId: string): Scenario | undefined {
  return scenarios.find((s) => s.match.id === matchId);
}
