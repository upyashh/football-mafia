import { NextResponse, type NextRequest } from "next/server";
import { syncAllCompetitions } from "@/lib/sync-fixtures";

/**
 * Hit on a schedule by Vercel Cron (see vercel.json at the repo root), never
 * by page loads — this is the only place fixtures/standings get synced from
 * the provider. Vercel sends `Authorization: Bearer <CRON_SECRET>` on
 * cron-invoked requests; reject anything else so this can't be hit publicly.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncAllCompetitions();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
