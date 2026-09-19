"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasOnboarded } from "@/lib/current-user";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(hasOnboarded() ? "/feed" : "/onboarding");
  }, [router]);

  return null;
}
