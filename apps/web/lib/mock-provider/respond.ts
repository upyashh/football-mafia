import { NextRequest, NextResponse } from "next/server";
import type { Envelope, ErrorBody, ErrorCode, Meta } from "@football-mafia/mock-data/provider";
import { buildAccessBlock, currentPlan, isGatedPath, recordRequest } from "./quota";

export class ProviderPlanError extends Error {}

function errorStatus(code: ErrorCode): number {
  switch (code) {
    case "unauthorized":
      return 401;
    case "plan_upgrade_required":
      return 403;
    case "not_found":
      return 404;
    default:
      return 400;
  }
}

export function errorResponse(code: ErrorCode, message: string): NextResponse<ErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status: errorStatus(code) });
}

export function requireAuth(request: NextRequest): NextResponse<ErrorBody> | null {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : "";
  const expected = process.env.MOCK_PROVIDER_TOKEN;

  if (!token) {
    return errorResponse("unauthorized", "Missing bearer token.");
  }
  if (expected && token !== expected) {
    return errorResponse("unauthorized", "Invalid bearer token.");
  }
  return null;
}

/** Call for endpoints gated to the developer tier on the real API. */
export function requireDeveloperPlan(pathname: string): NextResponse<ErrorBody> | null {
  if (isGatedPath(pathname) && currentPlan() === "starter") {
    return errorResponse(
      "plan_upgrade_required",
      "This endpoint requires the Developer plan. Upgrade at https://openfootapi.com/pricing.",
    );
  }
  return null;
}

export function envelope<T>(
  data: T,
  opts: { count?: number; totalCount?: number; sources?: string[] } = {},
): Envelope<T> {
  recordRequest();
  const count = opts.count ?? (Array.isArray(data) ? data.length : 1);
  const meta: Meta = {
    count,
    total_count: opts.totalCount ?? count,
    access: buildAccessBlock(),
    pagination: null,
    sources: opts.sources ?? ["fotmob"],
    environment: "beta",
  };
  return { data, meta };
}

export function jsonEnvelope<T>(
  data: T,
  opts?: { count?: number; totalCount?: number; sources?: string[] },
): NextResponse<Envelope<T>> {
  return NextResponse.json(envelope(data, opts));
}
