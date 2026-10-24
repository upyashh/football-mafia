import { NextResponse, type NextRequest } from "next/server";
import { getCachedMatch, getCachedMatchEvents } from "@/lib/match-data";

/**
 * Proves out the Postgres-backed match-data cache (apps/web/lib/match-data.ts):
 * reads through to /api/mock-openfoot on a cache miss or staleness, otherwise
 * serves straight from Postgres without touching the provider.
 *
 * Not wired into the Matches/match-detail UI yet — those still read static
 * mock-data fixtures (see the "real identity + DB-backed match cache" plan's
 * scope note on stats/lineups not being cached in this pass).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ providerRef: string }> },
) {
  const { providerRef } = await params;
  try {
    const [match, events] = await Promise.all([
      getCachedMatch(providerRef),
      getCachedMatchEvents(providerRef),
    ]);
    return NextResponse.json({ match, events });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
