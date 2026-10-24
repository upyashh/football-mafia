"use client";

import { useEffect } from "react";
import { useSelectedClub } from "@/lib/use-selected-club";

/** Sets --club-accent on <html> whenever the signed-in user's club changes. */
export function ClubAccentProvider({ children }: { children: React.ReactNode }) {
  const { club } = useSelectedClub();

  useEffect(() => {
    if (!club) return;
    document.documentElement.style.setProperty("--club-accent", club.primaryColor);
  }, [club?.primaryColor]);

  return children;
}
