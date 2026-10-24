import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Request-scoped Supabase client that reads/writes the session via Next.js
 * cookies, so server components/route handlers see the signed-in user.
 * Use this for anything that should respect RLS as the current user.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session instead, so a failed cookie write here is fine.
          }
        },
      },
    },
  );
}

/**
 * Service-role client that bypasses RLS entirely. Server-only, never bundle
 * into client code. Use for the match-data cache writer (the "ingestion"
 * path) which must write reference tables that clients can only read.
 */
export function createSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
