import { NextRequest, NextResponse } from "next/server";
import type { ChatMessage } from "@football-mafia/mock-data";
import { addStandMessage, clearStandMessages, getStandMessages } from "@/lib/chat-store";

export const dynamic = "force-dynamic";

/** Real chat messages for this stand, shared across every client. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ standId: string }> },
) {
  const { standId } = await params;
  return NextResponse.json(await getStandMessages(standId), {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ standId: string }> },
) {
  const { standId } = await params;
  const body = await request.json();

  const { matchId, minute, authorId, authorUsername, authorClubId, body: text } = body ?? {};
  if (
    typeof matchId !== "string" ||
    typeof minute !== "number" ||
    typeof authorId !== "string" ||
    typeof authorUsername !== "string" ||
    typeof authorClubId !== "string" ||
    typeof text !== "string" ||
    !text.trim()
  ) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  const message: ChatMessage = {
    id: `${standId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    matchId,
    standId,
    minute,
    authorId,
    authorUsername,
    authorClubId,
    body: text.trim(),
  };

  await addStandMessage(standId, message);
  return NextResponse.json(message, { status: 201 });
}

/** Testing-only: clears a stand's chat history so you can start a fresh test run. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ standId: string }> },
) {
  const { standId } = await params;
  await clearStandMessages(standId);
  return NextResponse.json({ ok: true });
}
