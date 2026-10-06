import type { Club, Competition, HypeMatchPreview } from "@football-mafia/mock-data";
import { ClubBadge } from "@/components/club-badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatKickoffCountdown(kickoffAt: string) {
  const diffMs = new Date(kickoffAt).getTime() - Date.now();
  const hours = Math.max(0, Math.round(diffMs / (60 * 60 * 1000)));
  if (hours <= 0) return "Kicking off soon";
  if (hours === 1) return "Tonight · in 1 hour";
  return `Tonight · in ${hours} hours`;
}

function formatHypeCount(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export function HypeMatchCard({
  preview,
  competition,
  homeClub,
  awayClub,
  className,
}: {
  preview: HypeMatchPreview;
  competition: Competition;
  homeClub: Club;
  awayClub: Club;
  className?: string;
}) {
  const { match, rsvpCount, predictionSplit } = preview;

  return (
    <Card className={cn("bg-surface-card text-text-primary ring-1 ring-border-subtle", className)}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>
            {competition.name} · {formatKickoffCountdown(match.kickoffAt)}
          </span>
          <span>{formatHypeCount(rsvpCount)} hyped</span>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="flex flex-1 items-center justify-end gap-2">
            <span className="text-sm font-medium">{homeClub.name}</span>
            <ClubBadge club={homeClub} size="sm" />
          </div>
          <span className="text-xs font-medium text-text-secondary">vs</span>
          <div className="flex flex-1 items-center gap-2">
            <ClubBadge club={awayClub} size="sm" />
            <span className="text-sm font-medium">{awayClub.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-surface-page">
            <div
              className="h-full bg-event-goal"
              style={{ width: `${predictionSplit.home}%` }}
            />
            <div
              className="h-full bg-border-subtle"
              style={{ width: `${predictionSplit.away}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-text-secondary">
          <span>{homeClub.shortName} {predictionSplit.home}%</span>
          <span>{awayClub.shortName} {predictionSplit.away}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
