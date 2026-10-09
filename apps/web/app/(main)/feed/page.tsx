"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";
import {
  getClubForTeamId,
  getCompetitions,
  getLiveMatches,
  getPastMatches,
  getUpcomingHypeMatches,
  type Competition,
  type HypeMatchPreview,
  type Match,
} from "@football-mafia/mock-data";
import { useSelectedClub } from "@/lib/use-selected-club";
import { useStands } from "@/lib/use-stands";
import { FixtureCard } from "@/components/fixture-card";
import { ClubBadge } from "@/components/club-badge";
import { FeaturedLiveCard } from "@/components/featured-live-card";
import { CompactLiveRow } from "@/components/compact-live-row";
import { HypeMatchCard } from "@/components/hype-match-card";
import { TerracePreviewCard } from "@/components/terrace-preview-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FilterTab = "live" | "following" | string;

export default function FeedPage() {
  const { club } = useSelectedClub();
  const { yourStands, discoverStands, toggleJoin } = useStands();
  const [pastMatches, setPastMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [hypeMatches, setHypeMatches] = useState<HypeMatchPreview[]>([]);
  const [tab, setTab] = useState<FilterTab>("live");

  useEffect(() => {
    getPastMatches().then(setPastMatches);
    getLiveMatches().then(setLiveMatches);
    getCompetitions().then(setCompetitions);
    getUpcomingHypeMatches().then(setHypeMatches);
  }, []);

  const trendingStands = useMemo(
    () => [...discoverStands].sort((a, b) => b.activeCount - a.activeCount),
    [discoverStands],
  );

  const followingLiveMatches = useMemo(
    () =>
      liveMatches.filter(
        (match) => match.homeTeamId === club.id || match.awayTeamId === club.id,
      ),
    [liveMatches, club.id],
  );

  const visibleLiveMatches =
    tab === "live"
      ? liveMatches
      : tab === "following"
        ? followingLiveMatches
        : liveMatches.filter((match) => match.competitionId === tab);

  const [featuredMatch, ...restLiveMatches] = visibleLiveMatches;

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border-subtle bg-surface-page/95 px-4 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <ClubBadge club={club} size="sm" />
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
            <TabsTrigger value="live">Live ({liveMatches.length})</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            {competitions[0] && (
              <TabsTrigger value={competitions[0].id}>
                {competitions[0].name}
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      </div>

      {featuredMatch &&
        (() => {
          const competition = competitions.find(
            (c) => c.id === featuredMatch.competitionId,
          );
          const homeClub = getClubForTeamId(featuredMatch.homeTeamId);
          const awayClub = getClubForTeamId(featuredMatch.awayTeamId);
          if (!competition || !homeClub || !awayClub) return null;
          return (
            <section className="px-4">
              <FeaturedLiveCard
                match={featuredMatch}
                competition={competition}
                homeClub={homeClub}
                awayClub={awayClub}
                userStands={yourStands}
              />
            </section>
          );
        })()}

      {restLiveMatches.length > 0 && (
        <section className="flex flex-col gap-2 px-4">
          {restLiveMatches.map((match) => {
            const competition = competitions.find(
              (c) => c.id === match.competitionId,
            );
            const homeClub = getClubForTeamId(match.homeTeamId);
            const awayClub = getClubForTeamId(match.awayTeamId);
            if (!competition || !homeClub || !awayClub) return null;
            return (
              <CompactLiveRow
                key={match.id}
                match={match}
                competition={competition}
                homeClub={homeClub}
                awayClub={awayClub}
              />
            );
          })}
        </section>
      )}

      {hypeMatches.length > 0 && (
        <section className="flex flex-col gap-2 pt-1">
          <h2 className="px-4 text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Coming up
          </h2>
          <div className="flex flex-col gap-2 px-4">
            {hypeMatches.map((preview) => {
              const competition = competitions.find(
                (c) => c.id === preview.match.competitionId,
              );
              const homeClub = getClubForTeamId(preview.match.homeTeamId);
              const awayClub = getClubForTeamId(preview.match.awayTeamId);
              if (!competition || !homeClub || !awayClub) return null;
              return (
                <HypeMatchCard
                  key={preview.match.id}
                  preview={preview}
                  competition={competition}
                  homeClub={homeClub}
                  awayClub={awayClub}
                />
              );
            })}
          </div>
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

      <section className="flex flex-col gap-2 pt-1">
        <h2 className="px-4 text-xs font-semibold tracking-wide text-text-secondary uppercase">
          Recent results
        </h2>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1">
          {pastMatches.map((match) => {
            const competition = competitions.find(
              (c) => c.id === match.competitionId,
            );
            const homeClub = getClubForTeamId(match.homeTeamId);
            const awayClub = getClubForTeamId(match.awayTeamId);
            if (!competition || !homeClub || !awayClub) return null;
            return (
              <FixtureCard
                key={match.id}
                match={match}
                competition={competition}
                homeClub={homeClub}
                awayClub={awayClub}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
