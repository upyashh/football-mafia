"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type MatchTab = "events" | "stats" | "lineups" | "chat";

export function MatchTabBar({
  value,
  onValueChange,
}: {
  value: MatchTab;
  onValueChange: (tab: MatchTab) => void;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onValueChange(next as MatchTab)}
      className="border-b border-border-subtle bg-surface-card px-4 pt-2 pb-0"
    >
      <TabsList className="w-full">
        <TabsTrigger value="events" className="flex-1">
          Events
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex-1">
          Stats
        </TabsTrigger>
        <TabsTrigger value="lineups" className="flex-1">
          Lineups
        </TabsTrigger>
        <TabsTrigger value="chat" className="flex-1">
          Chat
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
