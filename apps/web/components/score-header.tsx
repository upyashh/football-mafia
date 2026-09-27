import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Club, Competition, Match } from "@football-mafia/mock-data";
import { ClubBadge } from "@/components/club-badge";
import { LiveBadge } from "@/components/live-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatKickoffTime(kickoffAt: string) {
  return new Date(kickoffAt).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ScoreHeader({
  match,
  homeClub,
  awayClub,
  competition,
}: {
  match: Match;
  homeClub: Club;
  awayClub: Club;
  competition: Competition;
}) {
  return (
    <header className="sticky top-0 z-40 flex flex-col gap-3 border-b border-border-subtle bg-surface-card px-4 pt-3 pb-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/feed" />}
        >
          <ChevronLeft />
          Back
        </Button>
        <Badge variant="secondary">{competition.name}</Badge>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <ClubBadge club={homeClub} size="lg" />
          <span className="text-sm font-medium text-text-primary">
            {homeClub.shortName}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 px-3">
          <span className="text-2xl font-bold text-text-primary tabular-nums">
            {match.homeScore} – {match.awayScore}
          </span>
          {match.status === "LIVE" && (
            <LiveBadge minute={match.minute ?? 0} />
          )}
          {match.status === "PAUSED" && (
            <LiveBadge minute={match.minute ?? 45} paused />
          )}
          {match.status === "SCHEDULED" && (
            <Badge variant="outline" className="text-[11px]">
              {formatKickoffTime(match.kickoffAt)}
            </Badge>
          )}
          {match.status === "FINISHED" && (
            <Badge variant="outline" className="text-[11px]">
              FT
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col items-center gap-1.5">
          <ClubBadge club={awayClub} size="lg" />
          <span className="text-sm font-medium text-text-primary">
            {awayClub.shortName}
          </span>
        </div>
      </div>
    </header>
  );
}
