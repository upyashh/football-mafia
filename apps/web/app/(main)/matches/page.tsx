import { getFixtures, type FixtureRecord } from "@/lib/match-catalog";
import { getCurrentUser } from "@/lib/current-user";
import { FixtureCard } from "@/components/fixture-card";

// Always fetches live fixtures from the provider/cache — never prerendered.
export const dynamic = "force-dynamic";

/** Your league's fixtures first, then your club's, then everything else — in that priority order. */
function orderFixtures(
  fixtures: FixtureRecord[],
  yourClubId: string | null,
  yourCompetitionId: string | null,
): FixtureRecord[] {
  if (!yourClubId && !yourCompetitionId) return fixtures;

  const rank = (fixture: FixtureRecord) => {
    const isYourClub =
      fixture.homeClub.id === yourClubId || fixture.awayClub.id === yourClubId;
    const isYourCompetition = fixture.competition.id === yourCompetitionId;
    if (isYourClub) return 0;
    if (isYourCompetition) return 1;
    return 2;
  };

  return [...fixtures].sort((a, b) => rank(a) - rank(b));
}

export default async function MatchesPage() {
  const [{ live, past }, user] = await Promise.all([getFixtures(), getCurrentUser()]);

  const yourClubId = user?.clubId ?? null;
  const yourCompetitionId = yourClubId
    ? ([...live, ...past].find((f) => f.homeClub.id === yourClubId || f.awayClub.id === yourClubId)
        ?.competition.id ?? null)
    : null;

  const orderedLive = orderFixtures(live, yourClubId, yourCompetitionId);
  const orderedPast = orderFixtures(past, yourClubId, yourCompetitionId);

  return (
    <div className="flex flex-col gap-4 pb-4">
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-surface-page/95 px-4 py-3.5 backdrop-blur-sm">
        <h1 className="text-lg font-bold tracking-tight text-text-primary">
          Matches
        </h1>
      </header>

      {orderedLive.length > 0 && (
        <div className="flex flex-col gap-2 px-4">
          <h2 className="text-xs font-semibold tracking-wide text-live-accent uppercase">
            Live
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {orderedLive.map((fixture) => (
              <FixtureCard
                key={fixture.match.id}
                match={fixture.match}
                competition={fixture.competition}
                homeClub={fixture.homeClub}
                awayClub={fixture.awayClub}
                className="w-full"
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 px-4 pt-1">
        {orderedPast.map((fixture) => (
          <FixtureCard
            key={fixture.match.id}
            match={fixture.match}
            competition={fixture.competition}
            homeClub={fixture.homeClub}
            awayClub={fixture.awayClub}
            className="w-full"
          />
        ))}
      </div>
    </div>
  );
}
