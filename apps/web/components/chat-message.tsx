import type { Club } from "@football-mafia/mock-data";
import { cn } from "@/lib/utils";

const REACTION_EMOJI = ["🔥", "⚽", "👏", "😱", "❤️"];

/** Deterministic mock reaction counts per message — cosmetic only, not interactive. */
function mockReactions(messageId: string) {
  let hash = 0;
  for (const char of messageId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const count = 2 + (hash % 2);
  return Array.from({ length: count }, (_, i) => {
    const emoji = REACTION_EMOJI[(hash + i * 7) % REACTION_EMOJI.length];
    const reactionCount = 5 + ((hash >>> (i * 4)) % 340);
    return { emoji, count: reactionCount };
  });
}

export type ChatMessageBubbleProps = {
  id: string;
  body: string;
  minute: number;
  authorUsername: string;
  authorClub?: Club | null;
  mine: boolean;
};

export function ChatMessageBubble({
  id,
  body,
  minute,
  authorUsername,
  authorClub,
  mine,
}: ChatMessageBubbleProps) {
  return (
    <div
      className={cn(
        "mx-4 flex flex-col gap-2 rounded-xl bg-surface-card p-3 ring-1",
        mine ? "ring-event-goal" : "ring-border-subtle",
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ backgroundColor: authorClub?.primaryColor ?? "#6b7280" }}
        >
          {authorClub?.shortName?.slice(0, 2) ?? authorUsername.slice(0, 2).toUpperCase()}
        </span>
        <span className="truncate text-xs font-medium text-chat-text">
          @{authorUsername}
        </span>
        {mine && (
          <span className="shrink-0 rounded-full bg-event-goal px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
            You
          </span>
        )}
        <span className="ml-auto shrink-0 text-[11px] tabular-nums text-chat-text-secondary">
          {minute}&apos;
        </span>
      </div>

      <p className="text-sm text-chat-text">{body}</p>

      <div className="flex gap-3">
        {mockReactions(id).map(({ emoji, count }) => (
          <span
            key={emoji}
            className="flex items-center gap-1 text-xs text-chat-text-secondary"
          >
            <span>{emoji}</span>
            <span className="tabular-nums">{count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
