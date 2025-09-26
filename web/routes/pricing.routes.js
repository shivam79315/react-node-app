// routes/pricing.routes.js
import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// GET /api/pricing
router.get("/", async (req, res) => {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    res.json(plans);
  } catch (err) {
    console.error("Error fetching pricing plans:", err);
    res.status(500).json({ error: "Failed to fetch pricing plans" });
  }
});

export default router;