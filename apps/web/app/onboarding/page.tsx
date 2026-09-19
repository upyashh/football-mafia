"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clubs, competitions } from "@football-mafia/mock-data";
import { setSelectedClubId } from "@/lib/current-user";
import { ClubBadge } from "@/components/club-badge";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q),
    );
  }, [query]);

  function selectClub(clubId: string) {
    setSelectedClubId(clubId);
    router.replace("/feed");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 bg-surface-page px-5 pt-10 pb-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-bold text-text-primary">
          Pick your club
        </h1>
        <p className="text-sm text-text-secondary">
          We&apos;ll personalize your feed and app colors around this. You
          can change it later.
        </p>
      </div>

      <Input
        placeholder="Search clubs..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <ul className="flex flex-col gap-2">
        {filtered.map((club) => {
          const competition = competitions.find(
            (c) => c.id === club.competitionId,
          );
          return (
            <li key={club.id}>
              <button
                type="button"
                onClick={() => selectClub(club.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-card p-3 text-left active:opacity-80"
              >
                <ClubBadge club={club} />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-text-primary">
                    {club.name}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {competition?.name}
                  </span>
                </div>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="py-4 text-center text-sm text-text-secondary">
            No clubs match &quot;{query}&quot;.
          </li>
        )}
      </ul>
    </main>
  );
}
