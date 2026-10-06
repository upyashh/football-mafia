"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllStands, type Stand } from "@football-mafia/mock-data";
import {
  getStandOverrides,
  subscribeToStandChange,
  toggleStandJoined,
} from "./stand-membership";

/** Reactive, shared join/leave state for Stands — single source of truth for Home and /stands. */
export function useStands() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getAllStands().then(setStands);
    setOverrides(getStandOverrides());
    return subscribeToStandChange(() => setOverrides(getStandOverrides()));
  }, []);

  const resolvedStands = useMemo(
    () =>
      stands.map((stand) => ({
        ...stand,
        joined: overrides[stand.id] ?? stand.joined,
      })),
    [stands, overrides],
  );

  const yourStands = useMemo(
    () => resolvedStands.filter((stand) => stand.joined),
    [resolvedStands],
  );

  const discoverStands = useMemo(
    () =>
      resolvedStands.filter(
        (stand) => !stand.joined && stand.visibility !== "private",
      ),
    [resolvedStands],
  );

  const toggleJoin = (standId: string) => {
    const stand = resolvedStands.find((s) => s.id === standId);
    if (!stand) return;
    toggleStandJoined(standId, stand.joined);
  };

  return { stands: resolvedStands, yourStands, discoverStands, toggleJoin };
}
