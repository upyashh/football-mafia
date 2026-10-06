import type { ChatMessage } from "@football-mafia/mock-data";

type StandEvent = { kind: "message"; message: ChatMessage } | { kind: "cleared" };
type Subscriber = (event: StandEvent) => void;

/**
 * In-memory, per-server-process message store keyed by stand id. Swappable
 * for a real DB later — every call site here is already async-shaped where
 * it matters (the route handlers), so the storage itself is the only thing
 * that would need to change.
 */
const messagesByStand = new Map<string, ChatMessage[]>();
const subscribersByStand = new Map<string, Set<Subscriber>>();

export function getStandMessages(standId: string): ChatMessage[] {
  return messagesByStand.get(standId) ?? [];
}

export function addStandMessage(standId: string, message: ChatMessage) {
  const list = messagesByStand.get(standId) ?? [];
  list.push(message);
  messagesByStand.set(standId, list);
  subscribersByStand
    .get(standId)
    ?.forEach((notify) => notify({ kind: "message", message }));
}

/** Testing-only: wipes a stand's chat history and tells connected tabs to clear their view. */
export function clearStandMessages(standId: string) {
  messagesByStand.delete(standId);
  subscribersByStand.get(standId)?.forEach((notify) => notify({ kind: "cleared" }));
}

export function subscribeToStand(standId: string, notify: Subscriber): () => void {
  const subs = subscribersByStand.get(standId) ?? new Set<Subscriber>();
  subs.add(notify);
  subscribersByStand.set(standId, subs);
  return () => subs.delete(notify);
}
