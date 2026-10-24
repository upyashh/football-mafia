import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = { id: string; username: string; clubId: string | null };

/**
 * Server-side current user: real Supabase session + the matching `profiles`
 * row. Returns null when signed out (middleware already redirects that case
 * for non-public routes, but server components/route handlers that read
 * this should still treat null as "no user").
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, club_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;

  return { id: user.id, username: profile.username, clubId: profile.club_id };
}
