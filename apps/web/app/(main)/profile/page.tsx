"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shuffle } from "lucide-react";
import { useSelectedClub } from "@/lib/use-selected-club";
import { useCurrentUser, signOut } from "@/lib/use-current-user";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { FixtureRecord } from "@/lib/match-catalog";
import { ClubBadge } from "@/components/club-badge";
import { Button } from "@/components/ui/button";

type LoggedMatch = { id: number; rating: number | null; fixture: FixtureRecord };

export default function ProfilePage() {
  const { club } = useSelectedClub();
  const user = useCurrentUser();
  const router = useRouter();
  const [logs, setLogs] = useState<LoggedMatch[]>([]);

  useEffect(() => {
    if (!user) {
      setLogs([]);
      return;
    }

    async function load() {
      const { data: matchLogs } = await supabaseBrowser
        .from("match_logs")
        .select("id, rating, match_id")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      const typedLogs = (matchLogs ?? []) as {
        id: number;
        rating: number | null;
        match_id: number;
      }[];

      const withFixtures = await Promise.all(
        typedLogs.map(async (log) => {
          const res = await fetch(`/api/matches/by-id/${log.match_id}`);
          if (!res.ok) return null;
          const { fixture } = (await res.json()) as { fixture: FixtureRecord | null };
          return fixture ? { id: log.id, rating: log.rating, fixture } : null;
        }),
      );
      setLogs(withFixtures.filter((l): l is LoggedMatch => l !== null));
    }
    load();
  }, [user]);

  return (
    <div className="flex flex-col gap-6 pb-4">
      <header className="flex flex-col items-center gap-3 px-4 pt-8">
        {club && <ClubBadge club={club} size="lg" />}
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-base font-semibold text-text-primary">
            {user?.username ?? "…"}
          </span>
          <span className="text-sm text-text-secondary">
            {club ? `${club.name} fan` : "No club selected"}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-text-primary hover:text-text-primary"
          onClick={() => router.push("/onboarding")}
        >
          <Shuffle />
          Switch club
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-text-secondary"
          onClick={async () => {
            await signOut();
            router.replace("/sign-in");
          }}
        >
          Sign out
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
          {logs.map(({ id, rating, fixture }) => (
            <Link
              key={id}
              href={`/match/${fixture.match.id}`}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-surface-card p-2.5 ring-1 ring-border-subtle transition-transform active:scale-[0.98]"
            >
              <div className="flex items-center gap-1">
                <ClubBadge club={fixture.homeClub} size="sm" />
                <ClubBadge club={fixture.awayClub} size="sm" />
              </div>
              <span className="text-xs font-medium text-text-primary tabular-nums">
                {fixture.match.homeScore}-{fixture.match.awayScore}
              </span>
              {rating != null && (
                <span className="text-[11px] text-text-secondary">
                  ★ {rating}/10
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
