"use client";

import { useEffect, useState } from "react";
import { clubs, type Club } from "@football-mafia/mock-data";
import { getSelectedClubId, setSelectedClubId, subscribeToClubChange } from "./current-user";

function resolveClub(clubId: string): Club {
  return clubs.find((c) => c.id === clubId) ?? clubs[0];
}

/** Reactive access to the mock-user's currently selected club. */
export function useSelectedClub() {
  const [clubId, setClubIdState] = useState(getSelectedClubId());

  useEffect(() => {
    setClubIdState(getSelectedClubId());
    return subscribeToClubChange(() => setClubIdState(getSelectedClubId()));
  }, []);

  return {
    club: resolveClub(clubId),
    setClub: (nextClubId: string) => setSelectedClubId(nextClubId),
  };
}
