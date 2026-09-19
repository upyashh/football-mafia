import type { Club } from "@football-mafia/mock-data";
import { cn } from "@/lib/utils";

export type ChatMessageBubbleProps = {
  body: string;
  authorUsername: string;
  authorClub?: Club | null;
  mine: boolean;
  /** False when the previous message in the stream is from the same author — collapses the header. */
  showAuthor: boolean;
};

export function ChatMessageBubble({
  body,
  authorUsername,
  authorClub,
  mine,
  showAuthor,
}: ChatMessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 px-4",
        mine ? "items-end" : "items-start",
      )}
    >
      {showAuthor && !mine && (
        <span className="px-1 text-[11px] font-medium text-chat-text-secondary">
          {authorUsername}
          {authorClub && (
            <span style={{ color: authorClub.primaryColor }}>
              {" "}
              · {authorClub.shortName}
            </span>
          )}
        </span>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm",
          mine
            ? "rounded-tr-sm bg-chat-bubble-mine text-white"
            : "rounded-tl-sm bg-chat-bubble-other text-chat-text",
        )}
      >
        {body}
      </div>
    </div>
  );
}
