"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import {
  getClubForTeamId,
  getCompetitions,
  getFeedPosts,
  getLiveMatches,
  getPastMatches,
  type Competition,
  type FeedPost as FeedPostType,
  type Match,
} from "@football-mafia/mock-data";
import { useSelectedClub } from "@/lib/use-selected-club";
import { FixtureCard } from "@/components/fixture-card";
import { LiveFixtureCard } from "@/components/live-fixture-card";
import { FeedPost } from "@/components/feed-post";
import { ClubBadge } from "@/components/club-badge";
import { Button } from "@/components/ui/button";

export default function FeedPage() {
  const { club } = useSelectedClub();
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [posts, setPosts] = useState<FeedPostType[]>([]);

  useEffect(() => {
    getPastMatches().then(setMatches);
    getLiveMatches().then(setLiveMatches);
    getCompetitions().then(setCompetitions);
  }, []);

  useEffect(() => {
    getFeedPosts(club.id).then(setPosts);
  }, [club.id]);

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
          size="sm"
          nativeButton={false}
          render={<Link href="/onboarding" />}
        >
          <Shuffle />
          Switch club
        </Button>
      </header>

      {liveMatches.length > 0 && (
        <section className="flex flex-col gap-2 pt-3">
          <h2 className="px-4 text-xs font-semibold tracking-wide text-live-accent uppercase">
            Live now
          </h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1">
            {liveMatches.map((match) => {
              const competition = competitions.find(
                (c) => c.id === match.competitionId,
              );
              const homeClub = getClubForTeamId(match.homeTeamId);
              const awayClub = getClubForTeamId(match.awayTeamId);
              if (!competition || !homeClub || !awayClub) return null;
              return (
                <LiveFixtureCard
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
      )}

      <section className="flex flex-col gap-2 pt-3">
        <h2 className="px-4 text-xs font-semibold tracking-wide text-text-secondary uppercase">
          Recent results
        </h2>
        <div className="flex gap-3 overflow-x-auto px-4 pb-1">
          {matches.map((match) => {
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

      <section className="flex flex-col">
        <h2 className="px-4 pb-2 text-xs font-semibold tracking-wide text-text-secondary uppercase">
          {club.name} community
        </h2>
        {posts.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-text-secondary">
            No posts yet for {club.name}.
          </p>
        )}
        {posts.map((post) => (
          <FeedPost key={post.id} post={post} />
        ))}
      </section>
    </div>
  );
}
