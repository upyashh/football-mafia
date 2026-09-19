import Link from "next/link";
import type { Club, Competition, Match } from "@football-mafia/mock-data";
import { ClubBadge } from "@/components/club-badge";
import { LiveBadge } from "@/components/live-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function formatKickoff(kickoffAt: string) {
  return new Date(kickoffAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export function FixtureCard({
  match,
  homeClub,
  awayClub,
  competition,
  className,
}: {
  match: Match;
  homeClub: Club;
  awayClub: Club;
  competition: Competition;
  className?: string;
}) {
  return (
    <Link href={`/match/${match.id}`} className={cn("block w-40 shrink-0", className)}>
      <Card className="bg-surface-card text-text-primary ring-1 ring-border-subtle transition-transform active:scale-[0.98]">
        <CardContent className="flex flex-col gap-2.5">
          <Badge variant="secondary" className="w-fit text-[10px] font-medium">
            {competition.name}
          </Badge>

          <div className="flex items-center justify-between gap-2">
            <ClubBadge club={homeClub} size="sm" />
            <span className="text-sm font-semibold tabular-nums">
              {match.homeScore} – {match.awayScore}
            </span>
            <ClubBadge club={awayClub} size="sm" />
          </div>

          <div className="flex items-center justify-between text-[11px] text-text-secondary">
            <span>{homeClub.shortName}</span>
            <span>{awayClub.shortName}</span>
          </div>

          {match.status === "LIVE" || match.status === "PAUSED" ? (
            <LiveBadge
              minute={match.minute ?? 0}
              paused={match.status === "PAUSED"}
              className="w-fit"
            />
          ) : (
            <span className="text-[11px] text-text-secondary">
              {formatKickoff(match.kickoffAt)}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
