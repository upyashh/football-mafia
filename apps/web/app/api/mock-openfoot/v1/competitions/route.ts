import { NextRequest } from "next/server";
import type { ProviderCompetition } from "@football-mafia/mock-data/provider";
import { jsonEnvelope, requireAuth } from "@/lib/mock-provider/respond";

const COMPETITIONS: ProviderCompetition[] = [
  { id: "comp-pl", name: "Premier League", countryCode: "GB", availableSeasons: ["2025-26", "2026-27"], coverage: { events: true, lineups: true, xg: true } },
  { id: "comp-laliga", name: "La Liga", countryCode: "ES", availableSeasons: ["2025-26", "2026-27"], coverage: { events: true, lineups: true, xg: true } },
  { id: "comp-ucl", name: "Champions League", countryCode: "EU", availableSeasons: ["2025-26", "2026-27"], coverage: { events: true, lineups: true, xg: false } },
];

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  return jsonEnvelope(COMPETITIONS);
}
