import type { Club, MatchEvent } from "@football-mafia/mock-data";
import { cn } from "@/lib/utils";

const LABELS: Record<MatchEvent["type"], string> = {
  KICKOFF: "Kick-off",
  GOAL: "GOAL",
  CARD_YELLOW: "Yellow card",
  CARD_RED: "Red card",
  SUB: "Substitution",
  HALFTIME: "Half-time",
  FULLTIME: "Full-time",
};

const ICONS: Record<MatchEvent["type"], string> = {
  KICKOFF: "▶",
  GOAL: "⚽",
  CARD_YELLOW: "\u{1F7E8}",
  CARD_RED: "\u{1F7E5}",
  SUB: "⇄",
  HALFTIME: "⏸",
  FULLTIME: "⏹",
};

/**
 * Inline event marker for the chat stream — visually distinct from a message
 * bubble (centered, pill-shaped, no author) so it never reads as a fan's text.
 */
export function ChatEventMarker({
  event,
  club,
}: {
  event: MatchEvent;
  club?: Club | null;
}) {
  return (
    <div className="flex justify-center py-1">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-chat-bubble-other px-3 py-1 text-[11px] font-medium text-chat-text-secondary",
        )}
      >
        <span className="tabular-nums">{event.minute}&apos;</span>
        <span>{ICONS[event.type]}</span>
        <span className="text-chat-text">{LABELS[event.type]}</span>
        {(event.playerName || club) && (
          <span>· {[event.playerName, club?.shortName].filter(Boolean).join(" ")}</span>
        )}
      </span>
    </div>
  );
}
