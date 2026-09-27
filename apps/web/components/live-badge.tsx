import { cn } from "@/lib/utils";

export function LiveBadge({
  minute,
  paused = false,
  className,
}: {
  minute: number;
  paused?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-live-accent/10 px-2 py-0.5 text-[11px] font-semibold text-live-accent",
        className,
      )}
    >
      {paused ? (
        "HT"
      ) : (
        <>
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-live-accent opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-live-accent" />
          </span>
          {minute}&apos;
        </>
      )}
    </span>
  );
}
