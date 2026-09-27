import type { Player } from "../types";
import { teams } from "./teams";

const FIRST_NAMES = [
  "Kai",
  "Marco",
  "Diego",
  "Bruno",
  "Yusuf",
  "Theo",
  "Elias",
  "Rafael",
  "Sami",
  "Lucas",
  "Nathan",
  "Mateo",
];

const LAST_NAMES = [
  "Rossi",
  "Silva",
  "Novak",
  "Kovac",
  "Diallo",
  "Fernandez",
  "Bakker",
  "Moreau",
  "Larsson",
  "Costa",
  "Okoye",
  "Petit",
];

// 1 GK, 4 DF, 4 MF, 2 FW per team, deterministic names per squad slot.
const SQUAD_TEMPLATE: Player["position"][] = [
  "GK",
  "DF",
  "DF",
  "DF",
  "DF",
  "MF",
  "MF",
  "MF",
  "MF",
  "FW",
  "FW",
];

function buildSquad(teamId: string, teamIndex: number): Player[] {
  return SQUAD_TEMPLATE.map((position, slot) => {
    const firstName = FIRST_NAMES[(teamIndex * 3 + slot) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(teamIndex * 5 + slot * 2) % LAST_NAMES.length];
    return {
      id: `${teamId}-p${slot + 1}`,
      teamId,
      name: `${firstName} ${lastName}`,
      position,
      shirtNumber: slot + 1,
    };
  });
}

export const players: Player[] = teams.flatMap((team, index) =>
  buildSquad(team.id, index),
);

export function squadForTeam(teamId: string): Player[] {
  return players.filter((p) => p.teamId === teamId);
}
