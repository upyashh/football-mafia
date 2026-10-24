"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { SessionUser } from "@/lib/current-user";

const listeners = new Set<() => void>();

function notifyProfileChange() {
  listeners.forEach((listener) => listener());
}

/** Fired after onboarding writes `profiles.club_id` so other mounted hooks refresh. */
export function subscribeToClubChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function fetchCurrentUser(): Promise<SessionUser | null> {
  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseBrowser
    .from("profiles")
    .select("username, club_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  return { id: user.id, username: profile.username, clubId: profile.club_id };
}

/** Client-side reactive access to the signed-in user's profile. */
export function useCurrentUser() {
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    function reload() {
      fetchCurrentUser().then((u) => {
        if (active) setUser(u);
      });
    }
    reload();

    const { data: sub } = supabaseBrowser.auth.onAuthStateChange(() => reload());
    const unsubscribeClub = subscribeToClubChange(reload);
    return () => {
      active = false;
      sub.subscription.unsubscribe();
      unsubscribeClub();
    };
  }, []);

  return user;
}

export async function setSelectedClubId(clubId: string) {
  const {
    data: { user },
  } = await supabaseBrowser.auth.getUser();
  if (!user) return;
  await supabaseBrowser.from("profiles").update({ club_id: clubId }).eq("id", user.id);
  notifyProfileChange();
}

export async function signOut() {
  await supabaseBrowser.auth.signOut();
  notifyProfileChange();
}
