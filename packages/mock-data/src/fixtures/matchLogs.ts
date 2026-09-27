import type { MatchLog } from "../types";

// Belongs to the mock "current user" (user-1, Arsenal-affiliated).
export const matchLogs: MatchLog[] = [
  {
    id: "log-1",
    userId: "user-1",
    matchId: "match-ars-mci",
    rating: 9,
    createdAt: "2026-09-06T17:00:00Z",
  },
  {
    id: "log-2",
    userId: "user-1",
    matchId: "match-liv-mun",
    rating: 7,
    createdAt: "2026-09-07T16:30:00Z",
  },
  {
    id: "log-3",
    userId: "user-1",
    matchId: "match-rma-fcb",
    rating: 8,
    createdAt: "2026-09-13T21:30:00Z",
  },
];
