import { NextRequest } from "next/server";
import type { ProviderStanding } from "@football-mafia/mock-data/provider";
import { errorResponse, jsonEnvelope, requireAuth } from "@/lib/mock-provider/respond";

const STANDINGS: Record<string, ProviderStanding[]> = {
  "comp-pl": [
    { competitionId: "comp-pl", teamId: "team_arsenal_gb", position: 1, played: 5, won: 4, drawn: 1, lost: 0, points: 13 },
    { competitionId: "comp-pl", teamId: "team_manchester_city_gb", position: 2, played: 5, won: 3, drawn: 1, lost: 1, points: 10 },
    { competitionId: "comp-pl", teamId: "team_liverpool_gb", position: 3, played: 5, won: 3, drawn: 1, lost: 1, points: 10 },
    { competitionId: "comp-pl", teamId: "team_manchester_united_gb", position: 4, played: 5, won: 2, drawn: 2, lost: 1, points: 8 },
  ],
  "comp-laliga": [
    { competitionId: "comp-laliga", teamId: "team_real_madrid_es", position: 1, played: 5, won: 4, drawn: 0, lost: 1, points: 12 },
    { competitionId: "comp-laliga", teamId: "team_barcelona_es", position: 2, played: 5, won: 4, drawn: 0, lost: 1, points: 12 },
    { competitionId: "comp-laliga", teamId: "team_atletico_madrid_es", position: 3, played: 5, won: 3, drawn: 1, lost: 1, points: 10 },
  ],
};

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get("competition");
  if (!competitionId) {
    return errorResponse("invalid_request", "Query param 'competition' is required.");
  }

  return jsonEnvelope(STANDINGS[competitionId] ?? []);
}
