import type { Team } from "../types";
import { clubs } from "./clubs";

export const teams: Team[] = clubs.map((club) => ({
  id: `team-${club.shortName.toLowerCase()}`,
  clubId: club.id,
  name: club.name,
}));

export function teamForClub(clubId: string): Team {
  const team = teams.find((t) => t.clubId === clubId);
  if (!team) throw new Error(`No team fixture for club ${clubId}`);
  return team;
}
