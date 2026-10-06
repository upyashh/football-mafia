"use client";

import Link from "next/link";
import { ChevronLeft, RotateCcw } from "lucide-react";
import type { Club, Competition, Match, Stand } from "@football-mafia/mock-data";
import { ClubBadge } from "@/components/club-badge";
import { LiveBadge } from "@/components/live-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Compact header for the full-screen stand view — score + live status stay visible above the feed. */
export function StandHeader({
  match,
  homeClub,
  awayClub,
  competition,
  stand,
  onResetTestMatch,
}: {
  match: Match;
  homeClub: Club;
  awayClub: Club;
  competition: Competition;
  stand: Stand;
  /** Testing-only: when provided, shows a button to restart the simulated match from kickoff. */
  onResetTestMatch?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex flex-col gap-2 border-b border-border-subtle bg-surface-card px-4 pt-3 pb-2.5">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-text-primary hover:text-text-primary"
          nativeButton={false}
          render={<Link href={`/match/${match.id}`} />}
        >
          <ChevronLeft />
          Back
        </Button>
        <Badge variant="secondary" className="truncate">
          {stand.name}
        </Badge>
        {onResetTestMatch && (
          <Button
            variant="ghost"
            size="sm"
            className="text-text-secondary hover:text-text-primary"
            onClick={onResetTestMatch}
            title="Testing only: restart this match from kickoff and clear chat"
          >
            <RotateCcw className="size-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-1.5">
          <ClubBadge club={homeClub} size="sm" />
          <span className="truncate text-xs font-medium text-text-primary">
            {homeClub.shortName}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="text-lg font-bold text-text-primary tabular-nums">
            {match.homeScore} – {match.awayScore}
          </span>
          {match.status === "LIVE" && <LiveBadge minute={match.minute ?? 0} />}
          {match.status === "PAUSED" && (
            <LiveBadge minute={match.minute ?? 45} paused />
          )}
          {match.status === "FINISHED" && (
            <Badge variant="outline" className="text-[11px]">
              FT
            </Badge>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-1.5">
          <span className="truncate text-xs font-medium text-text-primary">
            {awayClub.shortName}
          </span>
          <ClubBadge club={awayClub} size="sm" />
        </div>
      </div>

      <span className="text-center text-[11px] text-text-secondary">
        {competition.name}
      </span>
    </header>
  );
}
