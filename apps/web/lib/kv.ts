import { Redis } from "@upstash/redis";

/**
 * Shared key-value storage for state that must be consistent across every
 * serverless function instance (Vercel runs many, each with its own blank
 * memory — a plain in-memory Map only works for one long-lived process like
 * `next dev`). Backed by Upstash Redis when configured (set KV_REST_API_URL
 * / KV_REST_API_TOKEN, e.g. via the Vercel KV integration); falls back to an
 * in-process Map so local dev needs no setup.
 */

type Kv = {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  del(key: string): Promise<void>;
};

function createRedisKv(url: string, token: string): Kv {
  const redis = new Redis({ url, token });
  return {
    get: (key) => redis.get(key),
    set: (key, value) => redis.set(key, value).then(() => undefined),
    del: (key) => redis.del(key).then(() => undefined),
  };
}

function createMemoryKv(): Kv {
  const store = new Map<string, unknown>();
  return {
    get: async (key) => (store.has(key) ? (store.get(key) as never) : null),
    set: async (key, value) => {
      store.set(key, value);
    },
    del: async (key) => {
      store.delete(key);
    },
  };
}

const url = process.env.KV_REST_API_URL;
const token = process.env.KV_REST_API_TOKEN;

export const kv: Kv = url && token ? createRedisKv(url, token) : createMemoryKv();

export const usingSharedKv = Boolean(url && token);
