import { NextResponse, type NextRequest } from "next/server";
import { getFixtureByProviderRef } from "@/lib/match-catalog";

/** Backs the match-detail page for a single real top-5-league fixture. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ providerRef: string }> },
) {
  const { providerRef } = await params;
  try {
    const fixture = await getFixtureByProviderRef(providerRef);
    if (!fixture) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    return NextResponse.json(fixture);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
