"use client";

import { use, useEffect, useMemo, useState } from "react";
import {
  clubs,
  getAllStands,
  getClubForTeamId,
  getCompetitions,
  getMatchById,
  getMatchEvents,
  type Competition,
  type Match,
  type MatchEvent,
  type Stand,
  type User,
} from "@football-mafia/mock-data";
import { useLiveMatch } from "@/lib/use-live-match";
import { resetLiveMatchForTesting } from "@/lib/live-match-store";
import { getSessionUser } from "@/lib/current-user";
import { StandHeader } from "@/components/stand-header";
import { ChatTab } from "@/components/chat-tab";
import { FlashPickFeedback } from "@/components/flash-pick-feedback";

type StandPageData = {
  match: Match;
  competition: Competition;
  stand: Stand;
  events: MatchEvent[];
  currentUser: User;
};

export default function StandPage({
  params,
}: {
  params: Promise<{ id: string; standId: string }>;
}) {
  const { id, standId } = use(params);
  const [data, setData] = useState<StandPageData | null | undefined>(
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

      const [competitions, stands, events] = await Promise.all([
        getCompetitions(),
        getAllStands(),
        getMatchEvents(match.id),
      ]);
      const currentUser = getSessionUser();

      const competition = competitions.find(
        (c) => c.id === match.competitionId,
      );
      const stand = stands.find((s) => s.id === standId);

      if (!active || !competition || !stand) {
        if (active) setData(null);
        return;
      }
      setData({ match, competition, stand, events, currentUser });
    }

    load();
    return () => {
      active = false;
    };
  }, [id, standId]);

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

  if (data === null) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-text-secondary">
        Stand not found.
      </div>
    );
  }
  if (data === undefined || match === null) return null;

  const { competition, stand, currentUser } = data;
  const homeClub = getClubForTeamId(match.homeTeamId);
  const awayClub = getClubForTeamId(match.awayTeamId);
  if (!homeClub || !awayClub) return null;

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-surface-page">
      <StandHeader
        match={match}
        competition={competition}
        homeClub={homeClub}
        awayClub={awayClub}
        stand={stand}
        onResetTestMatch={() => {
          resetLiveMatchForTesting(match.id);
          fetch(`/api/stands/${standId}/messages`, { method: "DELETE" }).catch(
            () => {},
          );
        }}
      />
      <FlashPickFeedback
        matchId={match.id}
        standId={standId}
        events={events}
        minute={match.minute ?? 0}
        matchStatus={match.status}
      />

      <ChatTab
        matchId={match.id}
        initialStandId={standId}
        events={events}
        currentUser={currentUser}
        homeClub={homeClub}
        awayClub={awayClub}
        homeTeamId={match.homeTeamId}
        awayTeamId={match.awayTeamId}
        getClubById={(clubId) => clubs.find((c) => c.id === clubId) ?? null}
        minute={match.minute ?? 0}
        matchStatus={match.status}
      />
    </div>
  );
}
