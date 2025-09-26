import { DeliveryMethod } from "@shopify/shopify-api";
import shopify from './db/shopify.js';  
import fs from "fs";
import path from "path";

const logFile = path.join(process.cwd(), "logs", "uninstall.log");

// helper to log uninstall events
function logUninstall(shop, error = null) {
  const timestamp = new Date().toISOString();
  const message = error
    ? `[${timestamp}] ❌ Failed uninstall cleanup for ${shop}: ${error}\n`
    : `[${timestamp}] ✅ App uninstalled from ${shop}\n`;

  fs.mkdirSync(path.dirname(logFile), { recursive: true });
  fs.appendFileSync(logFile, message, "utf8");
}

/**
 * @type {{[key: string]: import("@shopify/shopify-api").WebhookHandler}}
 */
export default {
  /**
   * App uninstalled. When this happens,
   *  * 1. Delete the app's session from your database, if you're storing them.
   *  * 2. Delete any data you have stored for the shop that uninstalled the app.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#app-uninstalled
   */
  APP_UNINSTALLED: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      console.log("🔥 APP_UNINSTALLED webhook received!", shop);

      try {
        // Delete the session by shop domain (myshopify.com is the session ID)
        await shopify.config.sessionStorage.deleteSession(shop);

        console.log(`✅ Deleted session for ${shop}`);
        logUninstall(shop);
      } catch (error) {
        console.error(`❌ Failed to delete session for ${shop}:`, error);
        logUninstall(shop, error.message || error);
      }

      return;
    },
  },

  /**
   * Customers can request their data from a store owner. When this happens,
   * Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-data_request
   */
  CUSTOMERS_DATA_REQUEST: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "orders_requested": [
      //     299938,
      //     280263,
      //     220458
      //   ],
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "data_request": {
      //     "id": 9999
      //   }
      // }
    },
  },

  /**
   * Store owners can request that data is deleted on behalf of a customer. When
   * this happens, Shopify invokes this privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#customers-redact
   */
  CUSTOMERS_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com",
      //   "customer": {
      //     "id": 191167,
      //     "email": "john@example.com",
      //     "phone": "555-625-1199"
      //   },
      //   "orders_to_redact": [
      //     299938,
      //     280263,
      //     220458
      //   ]
      // }
    },
  },

  /**
   * 48 hours after a store owner uninstalls your app, Shopify invokes this
   * privacy webhook.
   *
   * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
   */
  SHOP_REDACT: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);
      // Payload has the following shape:
      // {
      //   "shop_id": 954889,
      //   "shop_domain": "{shop}.myshopify.com"
      // }
    },
  },
};