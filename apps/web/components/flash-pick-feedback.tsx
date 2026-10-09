"use client";

import type { MatchEvent, MatchStatus } from "@football-mafia/mock-data";
import {
  FLASH_PICK_LABELS,
  getPreviousWindow,
  resolveWindowOutcome,
} from "@/lib/flash-pick";
import { useFlashPick } from "@/lib/use-flash-pick";
import { cn } from "@/lib/utils";

const POINTS_FOR_CORRECT = 10;

/** Last flash-pick's outcome + points, surfaced on the match's global view (all tabs). */
export function FlashPickFeedback({
  matchId,
  standId,
  events,
  minute,
  matchStatus,
}: {
  matchId: string;
  standId: string;
  events: MatchEvent[];
  minute: number;
  matchStatus: MatchStatus;
}) {
  const previousWindow = getPreviousWindow(minute);
  const { pick } = useFlashPick(matchId, standId, previousWindow?.index ?? -1);

  if (!previousWindow || !pick) return null;

  const outcome = resolveWindowOutcome(events, previousWindow, matchStatus, minute);
  if (!outcome) return null;

  const correct = outcome === pick;

  return (
    <div className="flex items-center gap-1.5 border-b border-border-subtle bg-surface-card px-4 py-1.5 text-[11px] font-medium text-text-secondary">
      <span>Last flash pick: {FLASH_PICK_LABELS[pick]}</span>
      <span className={cn(correct ? "text-event-goal" : "text-text-secondary")}>
        {correct ? `✅ +${POINTS_FOR_CORRECT}` : "❌ +0"}
      </span>
    </div>
  );
}
