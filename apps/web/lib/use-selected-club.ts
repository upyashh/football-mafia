"use client";

import { useEffect, useState } from "react";
import type { Club } from "@football-mafia/mock-data";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { setSelectedClubId, subscribeToClubChange, useCurrentUser } from "./use-current-user";

async function fetchClub(clubId: string | null | undefined): Promise<Club | null> {
  if (!clubId) return null;
  const { data } = await supabaseBrowser
    .from("clubs")
    .select("provider_ref, name, short_name, primary_color, secondary_color, competitions(provider_ref)")
    .eq("provider_ref", clubId)
    .maybeSingle();
  if (!data) return null;

  const competition = data.competitions as unknown as { provider_ref: string } | null;
  return {
    id: data.provider_ref,
    competitionId: competition?.provider_ref ?? "",
    name: data.name,
    shortName: data.short_name ?? data.name.slice(0, 3).toUpperCase(),
    primaryColor: data.primary_color ?? "#444444",
    secondaryColor: data.secondary_color ?? "#FFFFFF",
  };
}

/** Reactive access to the signed-in user's currently selected club, read from the real `clubs` table. */
export function useSelectedClub() {
  const user = useCurrentUser();
  const [club, setClub] = useState<Club | null>(null);
  const loading = user === undefined;

  useEffect(() => {
    let active = true;
    function reload() {
      fetchClub(user?.clubId).then((c) => {
        if (active) setClub(c);
      });
    }
    reload();
    const unsubscribe = subscribeToClubChange(reload);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [user?.clubId]);

  return {
    club: loading ? null : club,
    loading,
    setClub: (nextClubId: string) => setSelectedClubId(nextClubId),
  };
}
