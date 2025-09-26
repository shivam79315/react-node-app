import { BillingInterval } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";
import {PostgreSQLSessionStorage} from '@shopify/shopify-app-session-storage-postgresql';
import path from "path";
import dotenv from 'dotenv';
import { fileURLToPath } from "url";

// Recreate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Load the .env that lives in /web/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const DB_PATH = `${process.cwd()}/database.sqlite`;

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  "My Shopify One-Time Charge": {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: "USD",
    interval: BillingInterval.OneTime,
  },
};

const shopify = shopifyApp({
  api: {
    apiVersion: '2024-10',
    restResources,
    future: {
      customerAddressDefaultFix: true,
      lineItemBilling: true,
      unstable_managedPricingSupport: true,
    },
    billing: billingConfig,
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET,
    hostName: process.env.HOST ? process.env.HOST.replace(/https?:\/\//, '') : undefined,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: new PostgreSQLSessionStorage(
    process.env.DATABASE_URL,
  ),
});

export default shopify;