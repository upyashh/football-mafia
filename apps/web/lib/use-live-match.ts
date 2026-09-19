"use client";

import { useEffect, useState } from "react";
import type { LiveMatchState } from "@football-mafia/mock-data";
import {
  ensureTicking,
  getLiveMatchSnapshot,
  subscribeToLiveMatch,
} from "./live-match-store";

/** Reactive access to a simulated live match's current score/status/minute/events. */
export function useLiveMatch(matchId: string | null): LiveMatchState | null {
  const [state, setState] = useState<LiveMatchState | null>(
    matchId ? getLiveMatchSnapshot(matchId) : null,
  );

  useEffect(() => {
    if (!matchId) return;
    ensureTicking(matchId);
    setState(getLiveMatchSnapshot(matchId));
    return subscribeToLiveMatch(matchId, () =>
      setState(getLiveMatchSnapshot(matchId)),
    );
  }, [matchId]);

  return state;
}
