import IORedis from "ioredis";

export function makeRedis() {
  return new IORedis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    // optional timeouts if you want:
    // connectTimeout: 10000,
    // keepAlive: 10000,
  });
}