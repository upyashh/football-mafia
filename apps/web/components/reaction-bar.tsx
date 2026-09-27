import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["⚽", "🔥", "😂", "😱", "👏", "💩"];

/** Quick-tap emoji row above the message input — taps append the emoji as a message. */
export function ReactionBar({ onReact }: { onReact: (emoji: string) => void }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto border-t border-black/20 bg-chat-bg px-3 py-2">
      {QUICK_REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onReact(emoji)}
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full bg-chat-bubble-other text-base",
            "transition active:scale-90",
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
