// Wire-shape types mirroring OpenFootAPI's documented contract (docs/provider-adapter.md).
// These are NOT our internal types (see ../types.ts) — field names here match the
// provider's JSON exactly, on purpose, so the mock service and (later) the real API
// are structurally interchangeable behind the same FootballProvider adapter.

export type ProviderMatchStatus = "scheduled" | "live" | "finished" | "postponed";

export type ProviderTeam = {
  id: string; // provider_ref, e.g. "team_rayo_vallecano_es"
  shortName: string;
};

export type ProviderScore = {
  home: number;
  away: number;
};

export type ProviderMatch = {
  id: string; // provider_ref, opaque, churns across seasons — never persisted long-term
  competitionId: string;
  homeTeam: ProviderTeam;
  awayTeam: ProviderTeam;
  kickoffAt: string; // ISO 8601 UTC
  status: ProviderMatchStatus;
  score: ProviderScore; // 0/0 pre-kickoff, never null
  minute: number | null;
  addedTime: number | null;
  period: "first_half" | "second_half" | "half_time" | "full_time" | null;
  sourceRefs: { id: string; source: string }[];
};

export type ProviderEventType =
  | "kickoff"
  | "goal"
  | "yellow_card"
  | "red_card"
  | "substitution"
  | "half_time"
  | "full_time";

export type ProviderEvent = {
  id: string;
  matchId: string;
  minute: number;
  type: ProviderEventType;
  teamId?: string;
  playerName?: string;
  description?: string;
  sourceRefs: { id: string; source: string }[];
};

export type ProviderLineupEntry = {
  playerId: string;
  playerName: string;
  isStarting: boolean;
};

export type ProviderLineup = {
  matchId: string;
  teamId: string;
  formation: string;
  startingXI: ProviderLineupEntry[];
};

export type ProviderCompetition = {
  id: string;
  name: string;
  countryCode: string;
  availableSeasons: string[];
  coverage: { events: boolean; lineups: boolean; xg: boolean };
};

export type ProviderStanding = {
  competitionId: string;
  teamId: string;
  position: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
};

export type AccessPlan = "starter" | "developer";

export type AccessBlock = {
  plan: AccessPlan;
  quota: number;
  used: number;
  remaining: number;
  period: string;
};

export type Meta = {
  count: number;
  total_count: number;
  access: AccessBlock;
  pagination: { limit: number; offset: number } | null;
  sources: string[];
  environment: "beta";
};

export type Envelope<T> = {
  data: T;
  meta: Meta;
};

export type ErrorCode =
  | "plan_upgrade_required"
  | "unauthorized"
  | "not_found"
  | "invalid_request";

export type ErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
  };
};
