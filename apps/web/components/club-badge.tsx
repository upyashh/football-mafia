import type { Club } from "@football-mafia/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-6 text-[10px]",
  default: "size-9 text-xs",
  lg: "size-14 text-lg",
} as const;

export function ClubBadge({
  club,
  size = "default",
  className,
}: {
  club: Club;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Avatar className={cn(SIZES[size], className)} title={club.name}>
      <AvatarFallback
        className="font-bold"
        style={{
          backgroundColor: club.primaryColor,
          color: club.secondaryColor,
        }}
      >
        {club.shortName}
      </AvatarFallback>
    </Avatar>
  );
}
