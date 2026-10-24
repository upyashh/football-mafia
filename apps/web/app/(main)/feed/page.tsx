"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import { useSelectedClub } from "@/lib/use-selected-club";
import { useStands } from "@/lib/use-stands";
import type { FixtureRecord } from "@/lib/match-catalog";
import { FixtureCard } from "@/components/fixture-card";
import { ClubBadge } from "@/components/club-badge";
import { FeaturedLiveCard } from "@/components/featured-live-card";
import { CompactLiveRow } from "@/components/compact-live-row";
import { HypeMatchCard } from "@/components/hype-match-card";
import { TerracePreviewCard } from "@/components/terrace-preview-card";
import { StandingsSnippet } from "@/components/standings-snippet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StandingsRow } from "@/lib/match-catalog";

type FilterTab = "live" | string;

export default function FeedPage() {
  const { club } = useSelectedClub();
  const { yourStands, discoverStands, toggleJoin } = useStands();
  const [live, setLive] = useState<FixtureRecord[]>([]);
  const [upcoming, setUpcoming] = useState<FixtureRecord[]>([]);
  const [clubRecent, setClubRecent] = useState<FixtureRecord[]>([]);
  const [standings, setStandings] = useState<StandingsRow[]>([]);
  const [tab, setTab] = useState<FilterTab>("live");

  useEffect(() => {
    fetch("/api/matches/fixtures")
      .then((res) => res.json())
      .then((data: { live?: FixtureRecord[]; upcoming?: FixtureRecord[] }) => {
        setLive(data.live ?? []);
        setUpcoming(data.upcoming ?? []);
      });
  }, []);

  useEffect(() => {
    if (!club) {
      setClubRecent([]);
      return;
    }
    fetch(`/api/matches/club/${club.id}/recent`)
      .then((res) => res.json())
      .then((data: { results?: FixtureRecord[] }) => setClubRecent(data.results ?? []));
  }, [club]);

  useEffect(() => {
    if (!club) {
      setStandings([]);
      return;
    }
    fetch(`/api/matches/standings/${club.competitionId}`)
      .then((res) => res.json())
      .then((data: { standings?: StandingsRow[] }) => setStandings(data.standings ?? []));
  }, [club]);

  const yourCompetition = useMemo(() => {
    if (!club) return null;
    const fixture = [...live, ...upcoming, ...clubRecent].find(
      (f) => f.competition.id === club.competitionId,
    );
    return fixture?.competition ?? null;
  }, [live, upcoming, clubRecent, club]);

  const trendingStands = useMemo(
    () => [...discoverStands].sort((a, b) => b.activeCount - a.activeCount),
    [discoverStands],
  );

  const visibleLive =
    tab === "live" ? live : live.filter((fixture) => fixture.competition.id === tab);

  const [featured, ...restLive] = visibleLive;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border-subtle bg-surface-page/95 px-4 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          {club && <ClubBadge club={club} size="sm" />}
          <h1 className="text-lg font-bold tracking-tight text-text-primary">
            Football Mafia
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          nativeButton={false}
          render={<Link href="/onboarding" />}
        >
          <Settings2 />
        </Button>
      </header>

      <div className="px-4">
        <Tabs value={tab} onValueChange={(value) => setTab(value as FilterTab)} className="w-full">
          <TabsList className="w-full bg-surface-card ring-1 ring-border-subtle">
            <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
            {yourCompetition && (
              <TabsTrigger value={yourCompetition.id}>
                {yourCompetition.name}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>

      {featured && (
        <section className="px-4">
          <FeaturedLiveCard
            match={featured.match}
            competition={featured.competition}
            homeClub={featured.homeClub}
            awayClub={featured.awayClub}
            userStands={yourStands}
          />
        </section>
      )}

      {restLive.length > 0 && (
        <section className="flex flex-col gap-2 px-4">
          {restLive.map((fixture) => (
            <CompactLiveRow
              key={fixture.match.id}
              match={fixture.match}
              competition={fixture.competition}
              homeClub={fixture.homeClub}
              awayClub={fixture.awayClub}
            />
          ))}
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="flex flex-col gap-2 pt-1">
          <h2 className="px-4 text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Coming up
          </h2>
          <div className="flex flex-col gap-2 px-4">
            {upcoming.slice(0, 5).map((fixture) => (
              <HypeMatchCard
                key={fixture.match.id}
                preview={{ match: fixture.match, rsvpCount: 0, predictionSplit: { home: 50, away: 50 } }}
                competition={fixture.competition}
                homeClub={fixture.homeClub}
                awayClub={fixture.awayClub}
              />
            ))}
          </div>
        </section>
      )}

      {club && yourCompetition && standings.length > 0 && (
        <section className="px-4 pt-1">
          <StandingsSnippet
            competition={yourCompetition}
            rows={standings}
            highlightClubId={club.id}
          />
        </section>
      )}

      {trendingStands.length > 0 && (
        <section className="flex flex-col gap-2 pt-1">
          <h2 className="px-4 text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Trending terraces
          </h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1">
            {trendingStands.map((stand) => (
              <TerracePreviewCard
                key={stand.id}
                stand={stand}
                onToggleJoin={() => toggleJoin(stand.id)}
              />
            ))}
          </div>
        </section>
      )}

      {club && (
        <section className="flex flex-col gap-2 pt-1">
          <h2 className="px-4 text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Recent results
          </h2>
          {clubRecent.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto px-4 pb-1">
              {clubRecent.map((fixture) => (
                <FixtureCard
                  key={fixture.match.id}
                  match={fixture.match}
                  competition={fixture.competition}
                  homeClub={fixture.homeClub}
                  awayClub={fixture.awayClub}
                />
              ))}
            </div>
          ) : (
            <p className="px-4 text-sm text-text-secondary">
              No recent results for {club.name} yet.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
