import type { Lineup } from "../types";
import { matches } from "./matches";
import { squadForTeam } from "./players";

const FORMATIONS = ["4-3-3", "4-2-3-1", "4-4-2", "3-4-3"];

function formationFor(teamId: string): string {
  const hash = teamId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return FORMATIONS[hash % FORMATIONS.length];
}

function lineupFor(matchId: string, teamId: string): Lineup {
  return {
    matchId,
    teamId,
    formation: formationFor(teamId),
    startingXI: squadForTeam(teamId).map((player) => ({
      playerId: player.id,
      isStarting: true,
    })),
  };
}

export const lineups: Lineup[] = matches.flatMap((match) => [
  lineupFor(match.id, match.homeTeamId),
  lineupFor(match.id, match.awayTeamId),
]);
