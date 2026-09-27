"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageInput({
  onSend,
}: {
  onSend: (body: string) => void;
}) {
  const [value, setValue] = useState("");

  function submit() {
    const body = value.trim();
    if (!body) return;
    onSend(body);
    setValue("");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2 border-t border-black/20 bg-chat-bg px-3 py-2.5"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Say something..."
        className="flex-1 rounded-full bg-chat-bubble-other px-4 py-2 text-sm text-chat-text placeholder:text-chat-text-secondary focus:outline-none"
      />
      <Button
        type="submit"
        size="icon"
        disabled={!value.trim()}
        className="rounded-full bg-club-accent hover:bg-club-accent/90"
      >
        <Send className="size-4" />
      </Button>
    </form>
  );
}
