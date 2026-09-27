"use client";

import { useEffect, useState } from "react";
import {
  getClubForTeamId,
  getCompetitions,
  getLiveMatches,
  getPastMatches,
  type Competition,
  type Match,
} from "@football-mafia/mock-data";
import { FixtureCard } from "@/components/fixture-card";
import { LiveFixtureCard } from "@/components/live-fixture-card";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    getPastMatches().then(setMatches);
    getLiveMatches().then(setLiveMatches);
    getCompetitions().then(setCompetitions);
  }, []);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface-page/95 px-4 py-3.5 backdrop-blur-sm">
        <h1 className="text-lg font-bold tracking-tight text-text-primary">
          Matches
        </h1>
      </header>

      {liveMatches.length > 0 && (
        <div className="flex flex-col gap-2 px-4">
          <h2 className="text-xs font-semibold tracking-wide text-live-accent uppercase">
            Live
          </h2>
          <div className="grid grid-cols-2 gap-3">
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
                  className="w-full"
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 px-4 pt-1">
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
              className="w-full"
            />
          );
        })}
      </div>
    </div>
  );
}
