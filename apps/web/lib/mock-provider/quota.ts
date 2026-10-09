import type { AccessBlock, AccessPlan } from "@football-mafia/mock-data/provider";

const QUOTA_BY_PLAN: Record<AccessPlan, number> = {
  starter: 5000,
  developer: 250000,
};

// Endpoints gated to the developer tier on the real API (docs/provider-adapter.md).
const GATED_PATHS = ["/events", "/lineups", "/xg", "/live/stream"];

// In-memory per-process counter — this is a dev mock, no persistence needed.
let used = 0;

export function currentPlan(): AccessPlan {
  const raw = process.env.MOCK_PROVIDER_PLAN;
  return raw === "developer" ? "developer" : "starter";
}

export function isGatedPath(pathname: string): boolean {
  return GATED_PATHS.some((p) => pathname.endsWith(p) || pathname.includes(`${p}`));
}

export function recordRequest(): void {
  used += 1;
}

export function buildAccessBlock(): AccessBlock {
  const plan = currentPlan();
  const quota = QUOTA_BY_PLAN[plan];
  return {
    plan,
    quota,
    used,
    remaining: Math.max(quota - used, 0),
    period: "calendar_month",
  };
}
