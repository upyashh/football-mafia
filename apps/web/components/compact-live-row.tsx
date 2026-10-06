import type { Club, Competition, Match } from "@football-mafia/mock-data";
import { useLiveMatch } from "@/lib/use-live-match";
import { ClubBadge } from "@/components/club-badge";
import { LiveBadge } from "@/components/live-badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Smaller row for a second (or third) concurrently-live match. */
export function CompactLiveRow({
  match,
  competition,
  homeClub,
  awayClub,
  className,
}: {
  match: Match;
  competition: Competition;
  homeClub: Club;
  awayClub: Club;
  className?: string;
}) {
  const live = useLiveMatch(match.id);
  const minute = live?.minute ?? match.minute ?? 0;
  const homeScore = live?.homeScore ?? match.homeScore;
  const awayScore = live?.awayScore ?? match.awayScore;
  const paused = (live?.status ?? match.status) === "PAUSED";

  return (
    <Card className={cn("bg-surface-card text-text-primary ring-1 ring-border-subtle", className)}>
      <CardContent className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <ClubBadge club={homeClub} size="sm" />
          <span className="truncate text-xs text-text-secondary">{competition.name}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-semibold tabular-nums">
            {homeScore} – {awayScore}
          </span>
          <LiveBadge minute={minute} paused={paused} />
        </div>
        <div className="flex flex-1 items-center justify-end gap-2 overflow-hidden">
          <span className="truncate text-xs text-text-secondary">{awayClub.shortName}</span>
          <ClubBadge club={awayClub} size="sm" />
        </div>
      </CardContent>
    </Card>
  );
}
