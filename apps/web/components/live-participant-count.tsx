import { Users } from "lucide-react";

/** Pill shown under the score header, chat tab only — mock count for the skeleton. */
export function LiveParticipantCount({ count }: { count: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 border-b border-black/20 bg-chat-bg px-4 py-2 text-[11px] font-medium text-chat-text-secondary">
      <Users className="size-3" />
      {count.toLocaleString()} watching
    </div>
  );
}
