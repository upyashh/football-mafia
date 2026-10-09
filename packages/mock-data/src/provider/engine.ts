import type { ProviderEvent, ProviderMatch, ProviderMatchStatus } from "./contract-types";
import type { Scenario } from "./scenarios";

// Same pacing constant as ../live-match.ts (SIM_MS_PER_MINUTE) — kept as an independent
// copy since this operates on the provider wire shape, not our internal Match type.
export const SIM_MS_PER_MINUTE = 1500;

/**
 * Resolves a scenario's *current* provider-shape match + events, given elapsed real time
 * since kickoff. Only scenarios whose scripted `status` is "live" are actually simulated
 * as time-progressing; "scheduled" and "finished" scenarios are returned as authored,
 * since they're not meant to tick (a scheduled match doesn't start itself here, a
 * finished one doesn't need re-deriving).
 */
export function resolveScenario(scenario: Scenario, now: Date): { match: ProviderMatch; events: ProviderEvent[] } {
  const { match, events: script } = scenario;

  if (match.status !== "live") {
    return { match, events: script };
  }

  const elapsedMs = now.getTime() - new Date(match.kickoffAt).getTime();
  const elapsedMinutes = Math.floor(elapsedMs / SIM_MS_PER_MINUTE);

  let status: ProviderMatchStatus;
  let minute: number | null;
  let period: ProviderMatch["period"];

  if (elapsedMinutes < 0) {
    status = "scheduled";
    minute = null;
    period = null;
  } else if (elapsedMinutes < 45) {
    status = "live";
    minute = elapsedMinutes;
    period = "first_half";
  } else if (elapsedMinutes < 46) {
    status = "live";
    minute = 45;
    period = "half_time";
  } else if (elapsedMinutes < 90) {
    status = "live";
    minute = elapsedMinutes;
    period = "second_half";
  } else {
    status = "finished";
    minute = 90;
    period = "full_time";
  }

  const events = script.filter((event) => event.minute <= (minute ?? 0));
  const home = events.filter((e) => e.type === "goal" && e.teamId === match.homeTeam.id).length;
  const away = events.filter((e) => e.type === "goal" && e.teamId === match.awayTeam.id).length;

  const resolvedMatch: ProviderMatch = {
    ...match,
    status,
    minute,
    period,
    addedTime: minute === 45 || minute === 90 ? 2 : null,
    score: { home, away },
  };

  return { match: resolvedMatch, events };
}
