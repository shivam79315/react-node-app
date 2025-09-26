import express from "express";
import { productTagsQueue, productTagsQueueEvents } from "../queue/productTags.queue.js";

const router = express.Router();

// Enqueue tag job
router.post("/", async (req, res) => {
  try {
    const session = res.locals.shopify.session;
    if (!session) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const tags = req.body?.tags || [];
    if (!Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ success: false, error: "No tags provided" });
    }

    const job = await productTagsQueue.add("addTags", {
      sessionId: session.id,
      tags,
    });

    return res.json({ success: true, jobId: job.id });
  } catch (e) {
    console.error("Failed to enqueue tags job:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});


export default router;
