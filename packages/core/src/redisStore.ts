import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const redis = new IORedis(REDIS_URL);

export async function initContext(runId: string, input: any) {
  const key = `flow:${runId}:context`;
  const base = { input };
  await redis.set(key, JSON.stringify(base));
}

export async function getContext(runId: string) {
  const key = `flow:${runId}:context`;
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : {};
}

export async function mergeContext(runId: string, patch: Record<string, any>) {
  const key = `flow:${runId}:context`;
  const ctx = await getContext(runId);
  Object.assign(ctx, patch);
  await redis.set(key, JSON.stringify(ctx));
}

export async function getValue(runId: string, path: string) {
  const ctx = await getContext(runId);
  const parts = path.split(".");
  return parts.reduce<any>((acc, cur) => (acc == null ? acc : acc[cur]), ctx);
}

export async function clearContext(runId: string) {
  await redis.del(`flow:${runId}:context`);
}

export default redis;
