import type { HypeMatchPreview } from "../types";
import { upcomingMatches } from "./matches";

/** Static RSVP/prediction-split aggregate for Home's upcoming-match card. */
export const hypeMatches: HypeMatchPreview[] = [
  {
    match: upcomingMatches[0],
    rsvpCount: 8200,
    predictionSplit: { home: 58, away: 42 },
  },
];
