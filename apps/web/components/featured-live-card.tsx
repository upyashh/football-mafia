import Link from "next/link";
import type { Club, Competition, Match, Stand } from "@football-mafia/mock-data";
import { useLiveMatch } from "@/lib/use-live-match";
import { ClubBadge } from "@/components/club-badge";
import { LiveBadge } from "@/components/live-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Big hero live-match card — the primary entry point into a match's stand chat. */
export function FeaturedLiveCard({
  match,
  competition,
  homeClub,
  awayClub,
  userStands,
  className,
}: {
  match: Match;
  competition: Competition;
  homeClub: Club;
  awayClub: Club;
  userStands: Stand[];
  className?: string;
}) {
  const live = useLiveMatch(match.id);
  const minute = live?.minute ?? match.minute ?? 0;
  const homeScore = live?.homeScore ?? match.homeScore;
  const awayScore = live?.awayScore ?? match.awayScore;
  const paused = (live?.status ?? match.status) === "PAUSED";

  return (
    <Card className={cn("bg-surface-card text-text-primary ring-1 ring-border-subtle", className)}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">{competition.name}</span>
          <LiveBadge minute={minute} paused={paused} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <ClubBadge club={homeClub} size="lg" />
            <span className="max-w-full truncate text-sm font-medium">{homeClub.name}</span>
          </div>
          <span className="shrink-0 px-3 text-3xl font-bold tabular-nums">
            {homeScore} – {awayScore}
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <ClubBadge club={awayClub} size="lg" />
            <span className="max-w-full truncate text-sm font-medium">{awayClub.name}</span>
          </div>
        </div>

        {userStands.length > 0 && (
          <div className="flex gap-2 overflow-x-auto">
            {userStands.map((stand) => (
              <Link
                key={stand.id}
                href={`/match/${match.id}/stand/${stand.id}`}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-surface-page px-2.5 py-1 text-[11px] text-text-secondary ring-1 ring-border-subtle"
              >
                <span className="size-1.5 rounded-full bg-event-goal" />
                {stand.name} · {stand.activeCount.toLocaleString()}
              </Link>
            ))}
          </div>
        )}

        <Button
          size="lg"
          className="w-full bg-event-goal text-white hover:bg-event-goal/85"
          nativeButton={false}
          render={<Link href={`/match/${match.id}`} />}
        >
          Enter live stand
        </Button>
      </CardContent>
    </Card>
  );
}
