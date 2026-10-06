import type { ChatMessage } from "@football-mafia/mock-data";
import { kv } from "@/lib/kv";

function key(standId: string) {
  return `chat:${standId}`;
}

/**
 * Shared message history for a stand, stored in `kv` so every serverless
 * instance (and every device polling it) sees the same chat. Delivery is by
 * polling (see ChatTab) rather than push, since an in-memory SSE subscriber
 * list can't fan out across instances either.
 */
export async function getStandMessages(standId: string): Promise<ChatMessage[]> {
  return (await kv.get<ChatMessage[]>(key(standId))) ?? [];
}

export async function addStandMessage(standId: string, message: ChatMessage) {
  const list = await getStandMessages(standId);
  list.push(message);
  await kv.set(key(standId), list);
}

/** Testing-only: wipes a stand's chat history so you can start a fresh test run. */
export async function clearStandMessages(standId: string) {
  await kv.del(key(standId));
}
