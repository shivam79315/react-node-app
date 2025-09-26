// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import cors from "cors";

import shopify from "./db/shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";

// Routes
import { sseRoutes } from "./routes/products.sse.js";
import productTagsRoutes from "./routes/productTags.routes.js";
import productsRoutes from "./routes/products.routes.js";
import pricingRoutes from "./routes/pricing.routes.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT || "3000", 10);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

app.use(cors({ origin: "*", credentials: true }));

// Shopify auth
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);

// Webhooks FIRST (raw body required)
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// JSON parser AFTER webhooks
app.use(express.json());

app.use("/api/products/jobs", sseRoutes);

// All other product routes (require session)
app.use("/api/*", shopify.validateAuthenticatedSession());
app.use("/api/products", productsRoutes);
app.use("/api/product-tags", productTagsRoutes);
app.use("/api/pricing", pricingRoutes);

// Shopify CSP + frontend static
app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));