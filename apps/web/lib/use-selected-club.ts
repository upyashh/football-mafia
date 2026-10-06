"use client";

import { useEffect, useState } from "react";
import { clubs, currentUser, type Club } from "@football-mafia/mock-data";
import { getSelectedClubId, setSelectedClubId, subscribeToClubChange } from "./current-user";

function resolveClub(clubId: string): Club {
  return clubs.find((c) => c.id === clubId) ?? clubs[0];
}

/** Reactive access to the mock-user's currently selected club. */
export function useSelectedClub() {
  // Initialize with the SSR-safe default (not localStorage) so the first
  // client render matches the server-rendered HTML; the real, possibly
  // localStorage-backed value is applied post-mount below.
  const [clubId, setClubIdState] = useState(currentUser.clubId);

  useEffect(() => {
    setClubIdState(getSelectedClubId());
    return subscribeToClubChange(() => setClubIdState(getSelectedClubId()));
  }, []);

  return {
    club: resolveClub(clubId),
    setClub: (nextClubId: string) => setSelectedClubId(nextClubId),
  };
}
