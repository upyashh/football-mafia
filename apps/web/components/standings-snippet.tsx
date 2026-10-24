import Link from "next/link";
import type { Competition } from "@football-mafia/mock-data";
import type { StandingsRow } from "@/lib/match-catalog";
import { ClubBadge } from "@/components/club-badge";
import { Card, CardContent } from "@/components/ui/card";

export function StandingsSnippet({
  competition,
  rows,
  highlightClubId,
}: {
  competition: Competition;
  rows: StandingsRow[];
  highlightClubId: string;
}) {
  if (rows.length === 0) return null;

  const index = rows.findIndex((row) => row.club.id === highlightClubId);
  const start = Math.max(0, Math.min(index - 1, rows.length - 3));
  const visible = index === -1 ? rows.slice(0, 3) : rows.slice(start, start + 3);

  return (
    <Card className="bg-surface-card text-text-primary ring-1 ring-border-subtle">
      <CardContent className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
            {competition.name} table
          </span>
          <Link href="/matches" className="text-[11px] font-medium text-text-secondary underline">
            Full table
          </Link>
        </div>

        <div className="flex flex-col gap-1.5">
          {visible.map((row) => (
            <div
              key={row.club.id}
              className={
                row.club.id === highlightClubId
                  ? "flex items-center gap-2.5 rounded-md bg-surface-page px-2 py-1.5 ring-1 ring-border-subtle"
                  : "flex items-center gap-2.5 px-2 py-1.5"
              }
            >
              <span className="w-4 text-xs font-semibold tabular-nums text-text-secondary">
                {row.rank}
              </span>
              <ClubBadge club={row.club} size="sm" />
              <span className="flex-1 truncate text-sm">{row.club.name}</span>
              <span className="text-xs text-text-secondary tabular-nums">{row.played}p</span>
              <span className="text-sm font-semibold tabular-nums">{row.points}pts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
