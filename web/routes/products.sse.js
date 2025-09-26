import express from "express";
import { productsQueueEvents } from "../queue/products.queue.js";

export const sseRoutes = express.Router();

// Job stream via SSE (no session needed)
sseRoutes.get("/:id/stream", async (req, res) => {
    console.log("SSE connection opened for job", req.params.id);

  const jobId = String(req.params.id);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const keepAlive = setInterval(() => {
    res.write("event: ping\ndata: {}\n\n");
  }, 30000);

  const cleanup = () => {
    clearInterval(keepAlive);
    productsQueueEvents.off("progress", progressHandler);
    productsQueueEvents.off("completed", completedHandler);
    productsQueueEvents.off("failed", failedHandler);
    res.end();
  };

  const progressHandler = ({ jobId: id, data }) => {
    if (String(id) === jobId) {
        console.log("[SSE] sending progress", data);
        send("progress", data);
    }
    };

    const completedHandler = ({ jobId: id, returnvalue }) => {
    if (String(id) === jobId) {
        console.log("[SSE] sending completed for job", jobId);
        send("completed", { result: returnvalue });
        cleanup();
    }
    };

    const failedHandler = ({ jobId: id, failedReason }) => {
    if (String(id) === jobId) {
        console.log("[SSE] sending failed for job", jobId);
        send("failed", { error: failedReason });
        cleanup();
    }
    };

  productsQueueEvents.on("progress", progressHandler);
  productsQueueEvents.on("completed", completedHandler);
  productsQueueEvents.on("failed", failedHandler);

  req.on("close", cleanup);
});