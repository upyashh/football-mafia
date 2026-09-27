import type { Club, Competition, Match } from "@football-mafia/mock-data";
import { useLiveMatch } from "@/lib/use-live-match";
import { FixtureCard } from "@/components/fixture-card";

/** FixtureCard wrapper that overlays the simulated live ticker's score/minute/status. */
export function LiveFixtureCard({
  match,
  homeClub,
  awayClub,
  competition,
  className,
}: {
  match: Match;
  homeClub: Club;
  awayClub: Club;
  competition: Competition;
  className?: string;
}) {
  const live = useLiveMatch(match.id);
  const merged = live
    ? {
        ...match,
        status: live.status,
        minute: live.minute,
        homeScore: live.homeScore,
        awayScore: live.awayScore,
      }
    : match;

  return (
    <FixtureCard
      match={merged}
      homeClub={homeClub}
      awayClub={awayClub}
      competition={competition}
      className={className}
    />
  );
}
