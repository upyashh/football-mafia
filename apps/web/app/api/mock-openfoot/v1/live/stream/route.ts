import { NextRequest } from "next/server";
import { errorResponse, requireAuth } from "@/lib/mock-provider/respond";

// SSE streaming is Developer-gated on the real API, and even then only ~1min-fresh
// (docs/provider-adapter.md) — polling covers MVP, so this mock only stubs the gate
// rather than implementing a real stream. Revisit if the app needs push updates later.
export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;

  return errorResponse(
    "plan_upgrade_required",
    "Live streaming requires the Developer plan and is not implemented by this mock.",
  );
}
