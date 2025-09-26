//routes/products.routes.js
import express from "express";
import { productsQueue, productsQueueEvents } from "../queue/products.queue.js";
import shopify from "../db/shopify.js";

const router = express.Router();

// Count products
router.get("/count", async (_req, res) => {
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  const countData = await client.request(`
    query shopifyProductCount {
      productsCount {
        count
      }
    }
  `);

  res.status(200).send({ count: countData.data.productsCount.count });
});

// Enqueue product creation
router.post("/", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    if (!session) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const count = Math.max(1, Math.min(Number(req.body?.count ?? 100), 500));

    const job = await productsQueue.add("populate", {
      sessionId: session.id,
      count,
    });

    return res.json({ success: true, jobId: job.id, enqueued: true });
  } catch (e) {
    console.error("Failed to enqueue products:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// Job status (for polling if needed)
router.get("/jobs/:id", async (req, res) => {
  const job = await productsQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ success: false, error: "Job not found" });

  const state = await job.getState();
  const progress = job.progress;
  const result = state === "completed" ? job.returnvalue : null;

  res.json({ success: true, state, progress, result });
});

export default router;