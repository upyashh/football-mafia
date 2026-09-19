"use client";

import { useMemo, useState } from "react";
import type {
  ChatMessage,
  Club,
  MatchEvent,
  User,
} from "@football-mafia/mock-data";
import { ChatMessageBubble } from "@/components/chat-message";
import { ChatEventMarker } from "@/components/chat-event-marker";
import { LiveParticipantCount } from "@/components/live-participant-count";
import { ReactionBar } from "@/components/reaction-bar";
import { MessageInput } from "@/components/message-input";

type StreamItem =
  | { kind: "message"; minute: number; message: ChatMessage }
  | { kind: "event"; minute: number; event: MatchEvent };

/** Deterministic mock "watching" count — skeleton only, no real presence yet. */
function mockParticipantCount(matchId: string) {
  let hash = 0;
  for (const char of matchId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return 800 + (hash % 4200);
}

export function ChatTab({
  matchId,
  messages,
  events,
  currentUser,
  homeClub,
  awayClub,
  homeTeamId,
  awayTeamId,
  getClubById,
}: {
  matchId: string;
  messages: ChatMessage[];
  events: MatchEvent[];
  currentUser: User;
  homeClub: Club;
  awayClub: Club;
  homeTeamId: string;
  awayTeamId: string;
  getClubById: (clubId: string) => Club | null;
}) {
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);

  const stream = useMemo<StreamItem[]>(() => {
    const items: StreamItem[] = [
      ...messages.map(
        (message): StreamItem => ({
          kind: "message",
          minute: message.minute,
          message,
        }),
      ),
      ...localMessages.map(
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
  }, [messages, localMessages, events]);

  function sendMessage(body: string) {
    setLocalMessages((prev) => [
      ...prev,
      {
        id: `local-${prev.length}-${Date.now()}`,
        matchId,
        minute: events.at(-1)?.minute ?? 0,
        authorId: currentUser.id,
        authorUsername: currentUser.username,
        authorClubId: currentUser.clubId,
        body,
      },
    ]);
  }

  return (
    <div className="flex flex-1 flex-col bg-chat-bg">
      <LiveParticipantCount count={mockParticipantCount(matchId)} />

      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto py-3">
        {stream.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-chat-text-secondary">
            No messages yet — be the first to say something.
          </p>
        )}
        {stream.map((item, index) => {
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

          const prev = stream[index - 1];
          const showAuthor =
            !prev || prev.kind !== "message" || prev.message.authorId !== item.message.authorId;

          return (
            <ChatMessageBubble
              key={item.message.id}
              body={item.message.body}
              authorUsername={item.message.authorUsername}
              authorClub={getClubById(item.message.authorClubId)}
              mine={item.message.authorId === currentUser.id}
              showAuthor={showAuthor}
            />
          );
        })}
      </div>

      <ReactionBar onReact={sendMessage} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
