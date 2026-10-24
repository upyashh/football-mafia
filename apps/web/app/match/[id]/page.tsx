"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
  getClubForTeamId,
  getCompetitions,
  getLineups,
  getMatchById,
  getMatchEvents,
  getMatchStats,
  getPlayersByIds,
  type Club,
  type Competition,
  type Lineup,
  type Match,
  type MatchEvent,
  type MatchStats,
  type Player,
} from "@football-mafia/mock-data";
import { useLiveMatch } from "@/lib/use-live-match";
import { ScoreHeader } from "@/components/score-header";
import { MatchTabBar, type MatchTab } from "@/components/match-tab-bar";
import { StatsTab } from "@/components/stats-tab";
import { LineupsTab } from "@/components/lineups-tab";
import { EventsTab } from "@/components/events-tab";
import { MatchStandsTab } from "@/components/match-stands-tab";

type MatchPageData = {
  match: Match;
  competition: Competition;
  homeClub: Club;
  awayClub: Club;
  stats: MatchStats | null;
  homeLineup: Lineup | null;
  awayLineup: Lineup | null;
  players: Player[];
  events: MatchEvent[];
  /** Real top-5-league matches (OpenFootAPI-backed) have no events/stats/lineups
   * data this round (Starter-tier scope note) — only Stands is shown for these. */
  isRealFixture: boolean;
};

export default function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tab, setTab] = useState<MatchTab | null>(null);
  const [data, setData] = useState<MatchPageData | null | undefined>(
    undefined,
  );
  const live = useLiveMatch(id);

  useEffect(() => {
    let active = true;

    async function load() {
      // Real OpenFootAPI fixtures use provider match refs ("match_..."),
      // the mock-data scripted fixtures use "match-..." ids — try the mock
      // fixture first since it's a cheap in-memory lookup, then fall back
      // to the real-data route for everything else.
      const match = await getMatchById(id);
      if (match) {
        const [competitions, stats, lineups, events] = await Promise.all([
          getCompetitions(),
          getMatchStats(match.id),
          getLineups(match.id),
          getMatchEvents(match.id),
        ]);

        const competition = competitions.find(
          (c) => c.id === match.competitionId,
        );
        const homeLineup =
          lineups.find((l) => l.teamId === match.homeTeamId) ?? null;
        const awayLineup =
          lineups.find((l) => l.teamId === match.awayTeamId) ?? null;

        const playerIds = [homeLineup, awayLineup]
          .filter((l): l is Lineup => l !== null)
          .flatMap((l) => l.startingXI.map((entry) => entry.playerId));
        const players = await getPlayersByIds(playerIds);

        const homeClub = getClubForTeamId(match.homeTeamId);
        const awayClub = getClubForTeamId(match.awayTeamId);

        if (!active || !competition || !homeClub || !awayClub) return;
        setData({
          match,
          competition,
          homeClub,
          awayClub,
          stats,
          homeLineup,
          awayLineup,
          players,
          events,
          isRealFixture: false,
        });
        return;
      }

      const res = await fetch(`/api/matches/fixtures/${encodeURIComponent(id)}`);
      if (!res.ok) {
        if (active) setData(null);
        return;
      }
      const fixture = await res.json();
      if (!active) return;
      setData({
        match: fixture.match,
        competition: fixture.competition,
        homeClub: fixture.homeClub,
        awayClub: fixture.awayClub,
        stats: null,
        homeLineup: null,
        awayLineup: null,
        players: [],
        events: [],
        isRealFixture: true,
      });
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  const match: Match | null = useMemo(() => {
    if (!data) return null;
    if (!live) return data.match;
    return {
      ...data.match,
      status: live.status,
      minute: live.minute,
      homeScore: live.homeScore,
      awayScore: live.awayScore,
    };
  }, [data, live]);

  const events = live ? live.events : data?.events ?? [];
  const isLiveOrPaused = match?.status === "LIVE" || match?.status === "PAUSED";

  // Default tab: Events while live/paused, Stats otherwise, Stands for real
  // fixtures (no events/stats/lineups data this round — see MatchPageData).
  // Only applied once, before the user has picked a tab themselves.
  useEffect(() => {
    if (tab !== null || !match || !data) return;
    if (data.isRealFixture) {
      setTab("stands");
      return;
    }
    setTab(isLiveOrPaused ? "events" : "stats");
  }, [tab, match, data, isLiveOrPaused]);

  if (data === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-text-secondary">
        Match not found.
      </div>
    );
  }
  if (data === undefined || match === null || tab === null) return null;

  const { competition, stats, homeLineup, awayLineup, players, homeClub, awayClub, isRealFixture } = data;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-surface-page">
      <ScoreHeader
        match={match}
        competition={competition}
        homeClub={homeClub}
        awayClub={awayClub}
      />
      <MatchTabBar
        value={tab}
        onValueChange={setTab}
        showMatchDetailTabs={!isRealFixture}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {tab === "events" && (
          <div className="flex-1 overflow-y-auto">
            <EventsTab
              events={events}
              homeClub={homeClub}
              awayClub={awayClub}
              homeTeamId={match.homeTeamId}
              awayTeamId={match.awayTeamId}
            />
          </div>
        )}
        {tab === "stats" && stats && (
          <div className="flex-1 overflow-y-auto">
            <StatsTab stats={stats} homeClub={homeClub} awayClub={awayClub} />
          </div>
        )}
        {tab === "lineups" && homeLineup && awayLineup && (
          <div className="flex-1 overflow-y-auto">
            <LineupsTab
              homeClub={homeClub}
              awayClub={awayClub}
              homeLineup={homeLineup}
              awayLineup={awayLineup}
              players={players}
            />
          </div>
        )}
        {tab === "stands" && <MatchStandsTab matchId={match.id} />}
      </div>
    </div>
  );
}
