import type { Club, MatchEvent } from "@football-mafia/mock-data";
import { EventMarker } from "@/components/event-marker";

export function EventsTab({
  events,
  homeClub,
  awayClub,
  homeTeamId,
  awayTeamId,
}: {
  events: MatchEvent[];
  homeClub: Club;
  awayClub: Club;
  homeTeamId: string;
  awayTeamId: string;
}) {
  const sorted = [...events].sort((a, b) => b.minute - a.minute);

  return (
    <div className="flex flex-col divide-y divide-border-subtle">
      {sorted.length === 0 && (
        <p className="px-4 py-6 text-center text-sm text-text-secondary">
          No events yet.
        </p>
      )}
      {sorted.map((event) => (
        <EventMarker
          key={event.id}
          event={event}
          club={
            event.teamId === homeTeamId
              ? homeClub
              : event.teamId === awayTeamId
                ? awayClub
                : null
          }
        />
      ))}
    </div>
  );
}
