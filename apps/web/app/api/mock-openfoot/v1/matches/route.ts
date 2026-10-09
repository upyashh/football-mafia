import { NextRequest } from "next/server";
import { resolveScenario, scenarios } from "@football-mafia/mock-data/provider";
import { jsonEnvelope, requireAuth } from "@/lib/mock-provider/respond";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const competition = searchParams.get("competition");
  const date = searchParams.get("date"); // YYYY-MM-DD, filters by kickoff date (UTC)

  const now = new Date();
  let matches = scenarios.map((s) => resolveScenario(s, now).match);

  if (status) matches = matches.filter((m) => m.status === status);
  if (competition) matches = matches.filter((m) => m.competitionId === competition);
  if (date) matches = matches.filter((m) => m.kickoffAt.slice(0, 10) === date);

  return jsonEnvelope(matches);
}
