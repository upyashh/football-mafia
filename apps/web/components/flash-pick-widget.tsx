"use client";

import type { MatchEvent, MatchStatus } from "@football-mafia/mock-data";
import {
  FLASH_PICK_LABELS,
  getWindowForMinute,
  isWindowLocked,
  mockPickBreakdown,
  mockPickPoolSize,
  resolveWindowOutcome,
  type FlashPickOption,
} from "@/lib/flash-pick";
import { useFlashPick } from "@/lib/use-flash-pick";
import { cn } from "@/lib/utils";

export function FlashPickWidget({
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
  const pickWindow = getWindowForMinute(minute);
  const { pick, submit } = useFlashPick(matchId, standId, pickWindow.index);
  const locked = isWindowLocked(pickWindow, matchStatus, minute);
  const outcome = resolveWindowOutcome(events, pickWindow, matchStatus, minute);
  const breakdown = mockPickBreakdown(standId, matchId, pickWindow, pick);
  const pool = mockPickPoolSize(standId, matchId, pickWindow);

  return (
    <div className="border-t border-border-subtle bg-surface-card px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-text-secondary">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-1.5 rounded-full",
              locked ? "bg-text-secondary" : "bg-event-goal",
            )}
          />
          Flash pick · next {pickWindow.endMinute - pickWindow.startMinute} mins
        </span>
        <span>
          {locked ? "Locked" : `Locks in ${pickWindow.endMinute - minute}'`} · {pool.toLocaleString()} picks
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {breakdown.map(({ option, pct }) => (
          <FlashPickOptionButton
            key={option}
            option={option}
            pct={pct}
            selected={pick === option}
            locked={locked}
            won={locked && outcome === option}
            onSelect={() => submit(option, locked)}
          />
        ))}
      </div>
    </div>
  );
}

function FlashPickOptionButton({
  option,
  pct,
  selected,
  locked,
  won,
  onSelect,
}: {
  option: FlashPickOption;
  pct: number;
  selected: boolean;
  locked: boolean;
  won: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-xs font-medium ring-1 transition-colors",
        won
          ? "bg-event-goal/15 text-event-goal ring-event-goal"
          : selected
            ? "bg-event-goal/10 text-text-primary ring-event-goal"
            : "bg-surface-page text-text-primary ring-border-subtle",
        locked && !won && "opacity-60",
      )}
    >
      <span>{FLASH_PICK_LABELS[option]}</span>
      <span className="tabular-nums text-[11px] text-text-secondary">{pct}%</span>
    </button>
  );
}
