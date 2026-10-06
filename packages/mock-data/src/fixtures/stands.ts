import type { Stand } from "../types";

/**
 * Preview data for the Home feed's "your stands" chips and trending-terraces
 * section — not the full Stands directory/switcher (deferred). `joined` is a
 * static flag, same simplification as the single mock user elsewhere in this
 * package: no persistence, no real membership writes yet.
 */
export const stands: Stand[] = [
  {
    id: "stand-global-terrace",
    name: "Global Terrace",
    visibility: "public_global",
    description: "The main room — everyone, every match, all the banter.",
    memberCount: 42800,
    activeCount: 18400,
    joined: true,
  },
  {
    id: "stand-club-community",
    name: "Friends Stand",
    visibility: "private",
    description: "You and the crew, watching together.",
    memberCount: 7,
    activeCount: 7,
    joined: true,
  },
  {
    id: "stand-tactics",
    name: "Tactics & Pitch Heatmaps",
    visibility: "public_community",
    description: "xG breakdowns, lineup switches, referee analysis.",
    memberCount: 18500,
    activeCount: 3210,
    joined: false,
  },
  {
    id: "stand-derby-day",
    name: "Derby Day Ultras",
    visibility: "public_community",
    description: "Rivalry weekend chat, one room for every derby.",
    memberCount: 22100,
    activeCount: 4812,
    joined: false,
  },
];
