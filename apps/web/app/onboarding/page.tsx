"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Club, Competition } from "@football-mafia/mock-data";
import { setSelectedClubId } from "@/lib/use-current-user";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { ClubBadge } from "@/components/club-badge";
import { Input } from "@/components/ui/input";

type ClubRow = {
  provider_ref: string;
  name: string;
  short_name: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  competitions: { provider_ref: string; name: string; country_code: string | null } | null;
};

export default function OnboardingPage() {
  const [query, setQuery] = useState("");
  const [clubs, setClubs] = useState<Club[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const router = useRouter();

  // Reads the real top-5-league clubs/competitions seeded in Supabase
  // (supabase/migrations/0002_top5_leagues.sql), using each row's
  // provider_ref as the id — the same stable slug the clubs fixture
  // (packages/mock-data) and profiles.club_id already use.
  useEffect(() => {
    async function load() {
      const { data } = await supabaseBrowser
        .from("clubs")
        .select(
          "provider_ref, name, short_name, primary_color, secondary_color, competitions(provider_ref, name, country_code)",
        )
        .order("name");

      const rows = (data ?? []) as unknown as ClubRow[];
      const seenCompetitions = new Map<string, Competition>();
      const loadedClubs: Club[] = [];

      for (const row of rows) {
        if (!row.competitions) continue;
        if (!seenCompetitions.has(row.competitions.provider_ref)) {
          seenCompetitions.set(row.competitions.provider_ref, {
            id: row.competitions.provider_ref,
            name: row.competitions.name,
            countryCode: row.competitions.country_code ?? "",
          });
        }
        loadedClubs.push({
          id: row.provider_ref,
          competitionId: row.competitions.provider_ref,
          name: row.name,
          shortName: row.short_name ?? row.name.slice(0, 3).toUpperCase(),
          primaryColor: row.primary_color ?? "#444444",
          secondaryColor: row.secondary_color ?? "#FFFFFF",
        });
      }

      setClubs(loadedClubs);
      setCompetitions([...seenCompetitions.values()]);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q),
    );
  }, [query, clubs]);

  async function selectClub(clubId: string) {
    await setSelectedClubId(clubId);
    router.replace("/feed");
  }

  return (
    <main
      data-theme="dark"
      className="dark mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 bg-surface-page px-5 pt-10 pb-8"
    >
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
