export type Competition = {
  id: string;
  name: string;
  countryCode: string;
};

export type Club = {
  id: string;
  competitionId: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
};

export type Team = {
  id: string;
  clubId: string;
  name: string;
};

export type Player = {
  id: string;
  teamId: string;
  name: string;
  position: "GK" | "DF" | "MF" | "FW";
  shirtNumber: number;
};

export type MatchStatus = "SCHEDULED" | "LIVE" | "PAUSED" | "FINISHED";

export type Match = {
  id: string;
  competitionId: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoffAt: string;
  status: MatchStatus;
  minute?: number;
  homeScore: number;
  awayScore: number;
};

export type MatchEventType =
  | "KICKOFF"
  | "GOAL"
  | "CARD_YELLOW"
  | "CARD_RED"
  | "SUB"
  | "HALFTIME"
  | "FULLTIME";

export type MatchEvent = {
  id: string;
  matchId: string;
  minute: number;
  type: MatchEventType;
  teamId?: string;
  playerName?: string;
  description?: string;
};

export type SideStat<T = number> = { home: T; away: T };

export type MatchStats = {
  matchId: string;
  possession: SideStat;
  shots: SideStat;
  shotsOnTarget: SideStat;
  corners: SideStat;
  fouls: SideStat;
  yellowCards: SideStat;
  redCards: SideStat;
};

export type LineupEntry = {
  playerId: string;
  isStarting: boolean;
};

export type Lineup = {
  matchId: string;
  teamId: string;
  formation: string;
  startingXI: LineupEntry[];
};

export type FeedPost = {
  id: string;
  authorId: string;
  authorUsername: string;
  clubId: string;
  body: string;
  imageUrl?: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
};

export type MatchLog = {
  id: string;
  userId: string;
  matchId: string;
  rating?: number;
  createdAt: string;
};

export type User = {
  id: string;
  username: string;
  clubId: string;
};

export type ChatMessage = {
  id: string;
  matchId: string;
  minute: number;
  authorId: string;
  authorUsername: string;
  authorClubId: string;
  body: string;
};
