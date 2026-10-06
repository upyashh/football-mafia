"use client";

import { useEffect, useState } from "react";
import type { FlashPickOption } from "./flash-pick";
import { getFlashPick, submitFlashPick, subscribeToFlashPicks } from "./flash-pick-store";

/** Reactive read/write for a single (match, stand, window) flash-pick slot. */
export function useFlashPick(matchId: string, standId: string, windowIndex: number) {
  const [pick, setPick] = useState<FlashPickOption | null>(null);

  useEffect(() => {
    setPick(getFlashPick(matchId, standId, windowIndex));
    return subscribeToFlashPicks(() =>
      setPick(getFlashPick(matchId, standId, windowIndex)),
    );
  }, [matchId, standId, windowIndex]);

  function submit(option: FlashPickOption, locked: boolean) {
    submitFlashPick(matchId, standId, windowIndex, option, locked);
  }

  return { pick, submit };
}
