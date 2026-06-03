import { Redis } from '@upstash/redis';
import { env } from '@/config/env';

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Helper: set dengan TTL (seconds)
export const setCache = async (key: string, value: unknown, ttlSeconds?: number) => {
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, serialized, { ex: ttlSeconds });
  } else {
    await redis.set(key, serialized);
  }
};

// Helper: get dan parse JSON
export const getCache = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get<string>(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return data as unknown as T;
  }
};

// Helper: delete key
export const deleteCache = async (key: string) => {
  await redis.del(key);
};

export default redis;
