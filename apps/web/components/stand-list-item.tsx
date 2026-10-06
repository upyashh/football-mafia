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

export function StandListItem({
  stand,
  actionLabel,
  actionVariant = "default",
  onAction,
  className,
}: {
  stand: Stand;
  actionLabel: string;
  actionVariant?: "default" | "secondary";
  onAction: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("bg-surface-card text-text-primary ring-1 ring-border-subtle", className)}>
      <CardContent className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold">{stand.name}</span>
            <Badge variant="secondary" className="shrink-0 text-[10px] font-medium">
              {VISIBILITY_LABEL[stand.visibility]}
            </Badge>
          </div>
          <p className="line-clamp-1 text-xs text-text-secondary">{stand.description}</p>
          <div className="flex items-center gap-3 text-[11px] text-text-secondary">
            <span className="flex items-center gap-1 text-event-goal">
              <span className="size-1.5 rounded-full bg-event-goal" />
              {stand.activeCount.toLocaleString()} active
            </span>
            <span>{stand.memberCount.toLocaleString()} members</span>
          </div>
        </div>
        <Button
          size="sm"
          variant={actionVariant}
          className={actionVariant === "default" ? "bg-event-goal text-white hover:bg-event-goal/85" : undefined}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
