import { NextRequest } from "next/server";
import { findScenario, resolveScenario } from "@football-mafia/mock-data/provider";
import { errorResponse, jsonEnvelope, requireAuth } from "@/lib/mock-provider/respond";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = requireAuth(request);
  if (authError) return authError;

  const { id } = await params;
  const scenario = findScenario(id);
  if (!scenario) {
    return errorResponse("not_found", `No match found for id "${id}".`);
  }

  const { match } = resolveScenario(scenario, new Date());
  return jsonEnvelope(match);
}
