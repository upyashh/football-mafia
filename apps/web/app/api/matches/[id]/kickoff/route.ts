import { NextRequest, NextResponse } from "next/server";
import { getMatchKickoff, resetMatchKickoff } from "@/lib/match-kickoff-store";

export const dynamic = "force-dynamic";

/** Shared kickoff anchor for this match's simulated clock, same for every client. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json(
    { kickoffAt: getMatchKickoff(id) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Testing-only: restarts this match's shared clock from now, for every client. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({ kickoffAt: resetMatchKickoff(id) });
}
