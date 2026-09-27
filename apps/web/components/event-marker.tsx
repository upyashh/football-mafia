import type { Club, MatchEvent } from "@football-mafia/mock-data";
import { cn } from "@/lib/utils";

const LABELS: Record<MatchEvent["type"], string> = {
  KICKOFF: "Kick-off",
  GOAL: "Goal",
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

const COLORS: Partial<Record<MatchEvent["type"], string>> = {
  GOAL: "bg-event-goal/10 text-event-goal",
  CARD_YELLOW: "bg-event-card-yellow/10 text-event-card-yellow",
  CARD_RED: "bg-event-card-red/10 text-event-card-red",
};

export function EventMarker({
  event,
  club,
}: {
  event: MatchEvent;
  club?: Club | null;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <span className="w-8 shrink-0 text-right text-xs font-semibold text-text-secondary tabular-nums">
        {event.minute}&apos;
      </span>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full text-xs",
          COLORS[event.type] ?? "bg-surface-card text-text-secondary",
        )}
      >
        {ICONS[event.type]}
      </span>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-text-primary">
          {LABELS[event.type]}
        </span>
        {(event.playerName || club) && (
          <span className="text-xs text-text-secondary">
            {[event.playerName, club?.shortName].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>
    </div>
  );
}
