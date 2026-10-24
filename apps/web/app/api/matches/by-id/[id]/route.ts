import { NextResponse } from "next/server";
import { getFixtureByRowId } from "@/lib/match-catalog";

/** Backs the Profile page's match log: looks up a real fixture by the `matches` table's numeric row id. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rowId = Number(id);
  if (!Number.isFinite(rowId)) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const fixture = await getFixtureByRowId(rowId);
  if (!fixture) {
    return NextResponse.json({ fixture: null }, { status: 404 });
  }
  return NextResponse.json({ fixture });
}
