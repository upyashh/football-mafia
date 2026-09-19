import type { Club, Lineup, Player } from "@football-mafia/mock-data";

const POSITION_ORDER: Record<Player["position"], number> = {
  GK: 0,
  DF: 1,
  MF: 2,
  FW: 3,
};

function TeamColumn({
  club,
  lineup,
  players,
}: {
  club: Club;
  lineup: Lineup;
  players: Player[];
}) {
  const teamPlayers = players
    .filter((p) => lineup.startingXI.some((entry) => entry.playerId === p.id))
    .sort(
      (a, b) =>
        POSITION_ORDER[a.position] - POSITION_ORDER[b.position] ||
        a.shirtNumber - b.shirtNumber,
    );

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm font-semibold text-text-primary">
          {club.shortName}
        </span>
        <span className="text-xs text-text-secondary">
          {lineup.formation}
        </span>
      </div>
      <ul className="flex flex-col gap-2">
        {teamPlayers.map((player) => (
          <li
            key={player.id}
            className="flex items-center gap-2 text-sm text-text-primary"
          >
            <span className="w-5 shrink-0 text-right text-xs font-medium text-text-secondary">
              {player.shirtNumber}
            </span>
            <span className="truncate">{player.name}</span>
            <span className="ml-auto shrink-0 text-[10px] font-medium text-text-secondary">
              {player.position}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LineupsTab({
  homeClub,
  awayClub,
  homeLineup,
  awayLineup,
  players,
}: {
  homeClub: Club;
  awayClub: Club;
  homeLineup: Lineup;
  awayLineup: Lineup;
  players: Player[];
}) {
  return (
    <div className="flex gap-4 px-4 py-5">
      <TeamColumn club={homeClub} lineup={homeLineup} players={players} />
      <TeamColumn club={awayClub} lineup={awayLineup} players={players} />
    </div>
  );
}
