import { NextRequest } from "next/server";
import { findScenario } from "@football-mafia/mock-data/provider";
import { errorResponse, jsonEnvelope, requireAuth, requireDeveloperPlan } from "@/lib/mock-provider/respond";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const planError = requireDeveloperPlan(request.nextUrl.pathname);
  if (planError) return planError;

  const { id } = await params;
  const scenario = findScenario(id);
  if (!scenario) {
    return errorResponse("not_found", `No match found for id "${id}".`);
  }

  return jsonEnvelope(scenario.lineups);
}
