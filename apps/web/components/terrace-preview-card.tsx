import type { Stand } from "@football-mafia/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VISIBILITY_LABEL: Record<Stand["visibility"], string> = {
  public_global: "Global",
  public_community: "Community",
  private: "Private",
};

/** Preview card for the "trending terraces" row. Join state is shared via `useStands`. */
export function TerracePreviewCard({
  stand,
  onToggleJoin,
  className,
}: {
  stand: Stand;
  onToggleJoin: () => void;
  className?: string;
}) {
  const joined = stand.joined;

  return (
    <Card className={cn("w-56 shrink-0 bg-surface-card text-text-primary ring-1 ring-border-subtle", className)}>
      <CardContent className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px] font-medium">
            {VISIBILITY_LABEL[stand.visibility]}
          </Badge>
          <span className="flex items-center gap-1 text-[11px] text-event-goal">
            <span className="size-1.5 rounded-full bg-event-goal" />
            {stand.activeCount.toLocaleString()}
          </span>
        </div>

        <span className="text-sm font-semibold leading-snug">{stand.name}</span>
        <p className="line-clamp-2 text-xs text-text-secondary">{stand.description}</p>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-text-secondary">
            {stand.memberCount.toLocaleString()} members
          </span>
          <Button
            size="sm"
            variant={joined ? "secondary" : "default"}
            className={joined ? undefined : "bg-event-goal text-white hover:bg-event-goal/85"}
            onClick={onToggleJoin}
          >
            {joined ? "Joined" : "Join"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
