import { NextResponse, type NextRequest } from "next/server";
import { getRecentResultsForClub } from "@/lib/match-catalog";

/** A specific club's own recent finished results — not clipped by the global fixtures-list window. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clubRef: string }> },
) {
  const { clubRef } = await params;
  try {
    const results = await getRecentResultsForClub(clubRef, 5);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
