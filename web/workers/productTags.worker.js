import { Worker } from "bullmq";
import { makeRedis } from "../redis/connection.js"; 
import { PRODUCT_TAGS_QUEUE_NAME } from "../queue/productTags.queue.js";
import { addTagsToAllProducts } from "../services/product-tags.js";
import dotenv from "dotenv";

dotenv.config();
const connection = makeRedis();

export const productTagsWorker = new Worker(
    PRODUCT_TAGS_QUEUE_NAME,
    async (job) => {
        const { sessionId, tags } = job.data;
        const onProgress = (pct, meta) => job.updateProgress({ pct, ...meta }).catch(() => {});
        return await addTagsToAllProducts(sessionId, tags, onProgress);
    },
    { connection, concurrency: 1 }
)

productTagsWorker.on("progress", (job, progress) => {
  console.log(`[tags] job ${job.id} progress: ${JSON.stringify(progress)}`);
});

productTagsWorker.on("completed", (job) => {
  console.log(`[tags] completed job ${job.id}`, job.returnvalue);
});

productTagsWorker.on("failed", (job, err) => {
  console.error(`[tags] failed job ${job?.id}`, err);
});