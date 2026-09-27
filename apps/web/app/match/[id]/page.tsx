"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
  clubs,
  getChatMessages,
  getClubForTeamId,
  getCompetitions,
  getCurrentUser,
  getLineups,
  getMatchById,
  getMatchEvents,
  getMatchStats,
  getPlayersByIds,
  type ChatMessage,
  type Competition,
  type Lineup,
  type Match,
  type MatchEvent,
  type MatchStats,
  type Player,
  type User,
} from "@football-mafia/mock-data";
import { useLiveMatch } from "@/lib/use-live-match";
import { ScoreHeader } from "@/components/score-header";
import { MatchTabBar, type MatchTab } from "@/components/match-tab-bar";
import { StatsTab } from "@/components/stats-tab";
import { LineupsTab } from "@/components/lineups-tab";
import { EventsTab } from "@/components/events-tab";
import { ChatTab } from "@/components/chat-tab";

type MatchPageData = {
  match: Match;
  competition: Competition;
  stats: MatchStats | null;
  homeLineup: Lineup | null;
  awayLineup: Lineup | null;
  players: Player[];
  events: MatchEvent[];
  chatMessages: ChatMessage[];
  currentUser: User;
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
      const match = await getMatchById(id);
      if (!match) {
        if (active) setData(null);
        return;
      }

      const [competitions, stats, lineups, events, chatMessages, currentUser] =
        await Promise.all([
          getCompetitions(),
          getMatchStats(match.id),
          getLineups(match.id),
          getMatchEvents(match.id),
          getChatMessages(match.id),
          getCurrentUser(),
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

      if (!active || !competition) return;
      setData({
        match,
        competition,
        stats,
        homeLineup,
        awayLineup,
        players,
        events,
        chatMessages,
        currentUser,
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
  const chatMessages = live ? live.messages : data?.chatMessages ?? [];
  const isLiveOrPaused = match?.status === "LIVE" || match?.status === "PAUSED";

  // Default tab: Events while the match is live/paused, Stats otherwise —
  // only applied once, before the user has picked a tab themselves.
  useEffect(() => {
    if (tab !== null || !match) return;
    setTab(isLiveOrPaused ? "events" : "stats");
  }, [tab, match, isLiveOrPaused]);

  if (data === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-text-secondary">
        Match not found.
      </div>
    );
  }
  if (data === undefined || match === null || tab === null) return null;

  const { competition, stats, homeLineup, awayLineup, players } = data;
  const homeClub = getClubForTeamId(match.homeTeamId);
  const awayClub = getClubForTeamId(match.awayTeamId);
  if (!homeClub || !awayClub) return null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-surface-page">
      <ScoreHeader
        match={match}
        competition={competition}
        homeClub={homeClub}
        awayClub={awayClub}
      />
      <MatchTabBar value={tab} onValueChange={setTab} />

      {tab === "events" && (
        <EventsTab
          events={events}
          homeClub={homeClub}
          awayClub={awayClub}
          homeTeamId={match.homeTeamId}
          awayTeamId={match.awayTeamId}
        />
      )}
      {tab === "stats" && stats && (
        <StatsTab stats={stats} homeClub={homeClub} awayClub={awayClub} />
      )}
      {tab === "lineups" && homeLineup && awayLineup && (
        <LineupsTab
          homeClub={homeClub}
          awayClub={awayClub}
          homeLineup={homeLineup}
          awayLineup={awayLineup}
          players={players}
        />
      )}
      {tab === "chat" && (
        <ChatTab
          matchId={match.id}
          messages={chatMessages}
          events={events}
          currentUser={data.currentUser}
          homeClub={homeClub}
          awayClub={awayClub}
          homeTeamId={match.homeTeamId}
          awayTeamId={match.awayTeamId}
          getClubById={(clubId) => clubs.find((c) => c.id === clubId) ?? null}
        />
      )}
    </div>
  );
}
