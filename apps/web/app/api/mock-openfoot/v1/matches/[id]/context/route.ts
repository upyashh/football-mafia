import { NextRequest } from "next/server";
import { findScenario, resolveScenario } from "@football-mafia/mock-data/provider";
import { errorResponse, jsonEnvelope, requireAuth } from "@/lib/mock-provider/respond";

// Starter-tier endpoint (form/elo/xg-summary/odds) — not plan-gated.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const scenario = findScenario(id);
  if (!scenario) {
    return errorResponse("not_found", `No match found for id "${id}".`);
  }

  const { match } = resolveScenario(scenario, new Date());
  return jsonEnvelope({
    matchId: match.id,
    form: { home: ["W", "W", "D", "L", "W"], away: ["D", "W", "W", "W", "L"] },
    elo: { home: 1900, away: 1875 },
    xgSummary: { home: 1.4, away: 1.1 },
    odds: { home: 2.1, draw: 3.4, away: 3.2 },
  });
}
