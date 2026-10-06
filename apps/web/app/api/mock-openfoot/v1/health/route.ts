import { NextResponse } from "next/server";

// Real OpenFootAPI's /v1/health is free, no-auth. Mirror that here.
export async function GET() {
  return NextResponse.json({ status: "ok", environment: "beta" });
}
