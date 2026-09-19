import type { Club, MatchStats, SideStat } from "@football-mafia/mock-data";

function StatRow({
  label,
  stat,
  homeColor,
  awayColor,
}: {
  label: string;
  stat: SideStat;
  homeColor: string;
  awayColor: string;
}) {
  const total = stat.home + stat.away || 1;
  const homePct = (stat.home / total) * 100;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm font-medium text-text-primary">
        <span>{stat.home}</span>
        <span className="text-xs font-normal text-text-secondary">
          {label}
        </span>
        <span>{stat.away}</span>
      </div>
      <div className="flex h-1.5 overflow-hidden rounded-full bg-border-subtle">
        <div
          style={{ width: `${homePct}%`, backgroundColor: homeColor }}
          className="h-full"
        />
        <div
          style={{ width: `${100 - homePct}%`, backgroundColor: awayColor }}
          className="h-full"
        />
      </div>
    </div>
  );
}

export function StatsTab({
  stats,
  homeClub,
  awayClub,
}: {
  stats: MatchStats;
  homeClub: Club;
  awayClub: Club;
}) {
  return (
    <div className="flex flex-col gap-4 px-4 py-5">
      <StatRow
        label="Possession %"
        stat={stats.possession}
        homeColor={homeClub.primaryColor}
        awayColor={awayClub.primaryColor}
      />
      <StatRow
        label="Shots"
        stat={stats.shots}
        homeColor={homeClub.primaryColor}
        awayColor={awayClub.primaryColor}
      />
      <StatRow
        label="Shots on target"
        stat={stats.shotsOnTarget}
        homeColor={homeClub.primaryColor}
        awayColor={awayClub.primaryColor}
      />
      <StatRow
        label="Corners"
        stat={stats.corners}
        homeColor={homeClub.primaryColor}
        awayColor={awayClub.primaryColor}
      />
      <StatRow
        label="Fouls"
        stat={stats.fouls}
        homeColor={homeClub.primaryColor}
        awayColor={awayClub.primaryColor}
      />
      <StatRow
        label="Yellow cards"
        stat={stats.yellowCards}
        homeColor={homeClub.primaryColor}
        awayColor={awayClub.primaryColor}
      />
      <StatRow
        label="Red cards"
        stat={stats.redCards}
        homeColor={homeClub.primaryColor}
        awayColor={awayClub.primaryColor}
      />
    </div>
  );
}
