"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ChatMessage,
  Club,
  MatchEvent,
  MatchStatus,
  User,
} from "@football-mafia/mock-data";
import { useStands } from "@/lib/use-stands";
import { ChatMessageBubble } from "@/components/chat-message";
import { ChatEventMarker } from "@/components/chat-event-marker";
import { LiveParticipantCount } from "@/components/live-participant-count";
import { MessageInput } from "@/components/message-input";
import { FlashPickWidget } from "@/components/flash-pick-widget";
import { cn } from "@/lib/utils";

type StreamItem =
  | { kind: "message"; minute: number; message: ChatMessage }
  | { kind: "event"; minute: number; event: MatchEvent };

/** Deterministic mock "watching" count per room — skeleton only, no real presence yet. */
function mockParticipantCount(standId: string, matchId: string) {
  const key = `${standId}:${matchId}`;
  let hash = 0;
  for (const char of key) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 800 + (hash % 4200);
}

export function ChatTab({
  matchId,
  initialStandId,
  events,
  currentUser,
  homeClub,
  awayClub,
  homeTeamId,
  awayTeamId,
  getClubById,
  minute,
  matchStatus,
}: {
  matchId: string;
  initialStandId: string;
  events: MatchEvent[];
  currentUser: User;
  homeClub: Club;
  awayClub: Club;
  homeTeamId: string;
  awayTeamId: string;
  getClubById: (clubId: string) => Club | null;
  minute: number;
  matchStatus: MatchStatus;
}) {
  const router = useRouter();
  const { yourStands } = useStands();
  const selectedStandId = initialStandId;
  // Real messages sent through the server, keyed by stand id so switching
  // stands doesn't lose what was already loaded for the others.
  const [messagesByStand, setMessagesByStand] = useState<
    Record<string, ChatMessage[]>
  >({});
  const streamRef = useRef<HTMLDivElement>(null);

  // Real messages for this stand: poll the shared server store so every
  // device/browser watching this stand converges on the same chat history
  // (push via SSE can't fan out across Vercel's independent serverless
  // instances, so polling is what actually stays consistent in production).
  useEffect(() => {
    let active = true;

    async function refresh() {
      try {
        const res = await fetch(`/api/stands/${selectedStandId}/messages`, {
          cache: "no-store",
        });
        if (!res.ok || !active) return;
        const latest: ChatMessage[] = await res.json();
        setMessagesByStand((prev) => ({ ...prev, [selectedStandId]: latest }));
      } catch {
        // Offline or server hiccup — keep showing what we already have.
      }
    }

    refresh();
    const interval = setInterval(refresh, 2500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedStandId]);

  const stream = useMemo<StreamItem[]>(() => {
    const items: StreamItem[] = [
      ...(messagesByStand[selectedStandId] ?? []).map(
        (message): StreamItem => ({
          kind: "message",
          minute: message.minute,
          message,
        }),
      ),
      ...events.map(
        (event): StreamItem => ({ kind: "event", minute: event.minute, event }),
      ),
    ];
    return items.sort((a, b) => a.minute - b.minute);
  }, [messagesByStand, events, selectedStandId]);

  useEffect(() => {
    const el = streamRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [stream, selectedStandId]);

  function sendMessage(body: string) {
    fetch(`/api/stands/${selectedStandId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        minute,
        authorId: currentUser.id,
        authorUsername: currentUser.username,
        authorClubId: currentUser.clubId,
        body,
      }),
    }).catch(() => {});
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-chat-bg">
      {yourStands.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-border-subtle px-4 py-2.5">
          {yourStands.map((stand) => (
            <button
              key={stand.id}
              type="button"
              onClick={() => router.replace(`/match/${matchId}/stand/${stand.id}`)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                stand.id === selectedStandId
                  ? "bg-event-goal text-white"
                  : "bg-surface-card text-text-secondary ring-1 ring-border-subtle",
              )}
            >
              {stand.name}
            </button>
          ))}
        </div>
      )}

      <LiveParticipantCount count={mockParticipantCount(selectedStandId, matchId)} />

      <div
        ref={streamRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-3"
      >
        {stream.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-chat-text-secondary">
            No messages yet — be the first to say something.
          </p>
        )}
        {stream.map((item) => {
          if (item.kind === "event") {
            const club =
              item.event.teamId === homeTeamId
                ? homeClub
                : item.event.teamId === awayTeamId
                  ? awayClub
                  : null;
            return (
              <ChatEventMarker key={item.event.id} event={item.event} club={club} />
            );
          }

          return (
            <ChatMessageBubble
              key={item.message.id}
              id={item.message.id}
              body={item.message.body}
              minute={item.message.minute}
              authorUsername={item.message.authorUsername}
              authorClub={getClubById(item.message.authorClubId)}
              mine={item.message.authorId === currentUser.id}
            />
          );
        })}
      </div>

      {(matchStatus === "LIVE" || matchStatus === "PAUSED") && (
        <FlashPickWidget
          matchId={matchId}
          standId={selectedStandId}
          events={events}
          minute={minute}
          matchStatus={matchStatus}
        />
      )}

      <MessageInput onSend={sendMessage} />
    </div>
  );
}
