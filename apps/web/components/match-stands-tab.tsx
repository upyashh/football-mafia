"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStands } from "@/lib/use-stands";
import { StandListItem } from "@/components/stand-list-item";

/** Joined-stands picker shown in the match page's Stands tab — entering a card opens the full-screen stand chat. */
export function MatchStandsTab({ matchId }: { matchId: string }) {
  const router = useRouter();
  const { yourStands } = useStands();

  if (yourStands.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-text-secondary">
          You haven&apos;t joined any stands yet.
        </p>
        <Link
          href="/stands"
          className="text-sm font-semibold text-event-goal underline-offset-4 hover:underline"
        >
          Browse stands to join
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      {yourStands.map((stand) => (
        <StandListItem
          key={stand.id}
          stand={stand}
          actionLabel="Enter"
          onAction={() => router.push(`/match/${matchId}/stand/${stand.id}`)}
        />
      ))}
    </div>
  );
}
