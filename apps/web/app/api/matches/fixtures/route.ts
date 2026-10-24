import { NextResponse } from "next/server";
import { getFixtures } from "@/lib/match-catalog";

/** Backs the Matches tab and Feed page: live + upcoming + recent-past fixtures across the 5 seeded top-flight leagues. */
export async function GET() {
  try {
    const fixtures = await getFixtures();
    return NextResponse.json(fixtures);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
