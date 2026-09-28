import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  // The prototype still runs on mock data; skip session handling until
  // Supabase env is configured rather than 500-ing every request.
  if (!hasSupabaseEnv()) return NextResponse.next({ request });
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
