//workers/products.worker.js
import { Worker } from "bullmq";
import { makeRedis } from "../redis/connection.js";
import { PRODUCTS_QUEUE_NAME } from "../queue/products.queue.js";
import productCreator, { productCreatorBySessionId } from "../services/product-creator.js";
import dotenv from 'dotenv';
dotenv.config();

const connection = makeRedis();

// products.worker.js
export const productsWorker = new Worker(
  PRODUCTS_QUEUE_NAME,
  async (job) => {
    const { sessionId, count } = job.data;
    const onProgress = (pct, meta) => job.updateProgress({ pct, ...meta }).catch(() => {});
    return await productCreatorBySessionId(sessionId, count, onProgress);
  },
  { connection, concurrency: 1 }
);

productsWorker.on("progress", (job, progress) => {
  console.log(`[products] job ${job.id} progress: ${JSON.stringify(progress)}`);
});

productsWorker.on("completed", (job) => {
  console.log(`[products] completed job ${job.id}`, job.returnvalue);
});

productsWorker.on("failed", (job, err) => {
  console.error(`[products] failed job ${job?.id}`, err);
});