import { NextRequest } from "next/server";
import { findScenario, resolveScenario } from "@football-mafia/mock-data/provider";
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

  const { events } = resolveScenario(scenario, new Date());
  const shotMap = events
    .filter((e) => e.type === "goal")
    .map((e, i) => ({ id: `shot-${i}`, minute: e.minute, teamId: e.teamId, xg: 0.3 + (i % 3) * 0.1, outcome: "goal" }));

  return jsonEnvelope(shotMap);
}
