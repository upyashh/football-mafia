import { NextResponse, type NextRequest } from "next/server";
import { getStandings } from "@/lib/match-catalog";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ competitionRef: string }> },
) {
  const { competitionRef } = await params;
  try {
    const standings = await getStandings(competitionRef);
    return NextResponse.json({ standings });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
