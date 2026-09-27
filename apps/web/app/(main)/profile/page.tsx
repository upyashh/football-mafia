"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import {
  getClubForTeamId,
  getMatchById,
  getMatchLogs,
  type Match,
  type MatchLog,
} from "@football-mafia/mock-data";
import { useSelectedClub } from "@/lib/use-selected-club";
import { getCurrentUsername, resetOnboarding } from "@/lib/current-user";
import { ClubBadge } from "@/components/club-badge";
import { Button } from "@/components/ui/button";

type LoggedMatch = MatchLog & { match: Match };

export default function ProfilePage() {
  const { club } = useSelectedClub();
  const router = useRouter();
  const [logs, setLogs] = useState<LoggedMatch[]>([]);

  useEffect(() => {
    async function load() {
      const matchLogs = await getMatchLogs("user-1");
      const withMatches = await Promise.all(
        matchLogs.map(async (log) => {
          const match = await getMatchById(log.matchId);
          return match ? { ...log, match } : null;
        }),
      );
      setLogs(withMatches.filter((l): l is LoggedMatch => l !== null));
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header className="flex flex-col items-center gap-3 px-4 pt-8">
        <ClubBadge club={club} size="lg" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base font-semibold text-text-primary">
            {getCurrentUsername()}
          </span>
          <span className="text-sm text-text-secondary">{club.name} fan</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            resetOnboarding();
            router.replace("/onboarding");
          }}
        >
          <Shuffle />
          Switch club
        </Button>
      </header>

      <section className="flex flex-col gap-3 px-4">
        <h2 className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
          Match log
        </h2>

        {logs.length === 0 && (
          <p className="py-6 text-center text-sm text-text-secondary">
            No matches logged yet.
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {logs.map(({ id, rating, match }) => {
            const homeClub = getClubForTeamId(match.homeTeamId);
            const awayClub = getClubForTeamId(match.awayTeamId);
            if (!homeClub || !awayClub) return null;
            return (
              <Link
                key={id}
                href={`/match/${match.id}`}
                className="flex flex-col items-center gap-1.5 rounded-xl bg-surface-card p-2.5 ring-1 ring-border-subtle transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center gap-1">
                  <ClubBadge club={homeClub} size="sm" />
                  <ClubBadge club={awayClub} size="sm" />
                </div>
                <span className="text-xs font-medium text-text-primary tabular-nums">
                  {match.homeScore}-{match.awayScore}
                </span>
                {rating !== undefined && (
                  <span className="text-[11px] text-text-secondary">
                    ★ {rating}/10
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
