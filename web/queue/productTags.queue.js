import { Queue, QueueEvents } from "bullmq";
import { makeRedis } from "../redis/connection.js";

export const PRODUCT_TAGS_QUEUE_NAME = "product-tags";

const connection = makeRedis();

export const productTagsQueue = new Queue(PRODUCT_TAGS_QUEUE_NAME, { connection });

export const productTagsQueueEvents = new QueueEvents(PRODUCT_TAGS_QUEUE_NAME, { connection });

productTagsQueueEvents.waitUntilReady().then(() => {
  console.log("QueueEvents is ready for", PRODUCT_TAGS_QUEUE_NAME);
});