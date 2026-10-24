import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Lazily-created singleton anon-key Supabase client for client components.
 * Lazy so importing this module doesn't throw during build-time static
 * generation (e.g. /_not-found) in environments where the Supabase env vars
 * aren't set yet — the client is only actually constructed when a browser
 * calls into it.
 */
function getSupabaseBrowser() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}

export const supabaseBrowser = new Proxy(
  {},
  {
    get(_target, prop) {
      const value = getSupabaseBrowser()[prop as keyof ReturnType<typeof createBrowserClient>];
      return typeof value === "function" ? value.bind(getSupabaseBrowser()) : value;
    },
  },
) as ReturnType<typeof createBrowserClient>;
