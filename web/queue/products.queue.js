import { Queue, QueueEvents } from "bullmq";
import { makeRedis } from "../redis/connection.js";

export const PRODUCTS_QUEUE_NAME = "product-populate";

const connection = makeRedis();

export const productsQueue = new Queue(PRODUCTS_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600, count: 1000 },
  },
});

export const productsQueueEvents = new QueueEvents(PRODUCTS_QUEUE_NAME, {
  connection: makeRedis(), // QueueEvents should have its own connection
});

productsQueueEvents.waitUntilReady().then(() => {
  console.log("QueueEvents is ready for", PRODUCTS_QUEUE_NAME);
});
