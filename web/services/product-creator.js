import { GraphqlQueryError } from "@shopify/shopify-api";
import shopify from "../db/shopify.js";

const ADJECTIVES = [
  "autumn",
  "hidden",
  "bitter",
  "misty",
  "silent",
  "empty",
  "dry",
  "dark",
  "summer",
  "icy",
  "delicate",
  "quiet",
  "white",
  "cool",
  "spring",
  "winter",
  "patient",
  "twilight",
  "dawn",
  "crimson",
  "wispy",
  "weathered",
  "blue",
  "billowing",
  "broken",
  "cold",
  "damp",
  "falling",
  "frosty",
  "green",
  "long",
];

const NOUNS = [
  "waterfall",
  "river",
  "breeze",
  "moon",
  "rain",
  "wind",
  "sea",
  "morning",
  "snow",
  "lake",
  "sunset",
  "pine",
  "shadow",
  "leaf",
  "dawn",
  "glitter",
  "forest",
  "hill",
  "cloud",
  "meadow",
  "sun",
  "glade",
  "bird",
  "brook",
  "butterfly",
  "bush",
  "dew",
  "dust",
  "field",
  "fire",
  "flower",
];

export const DEFAULT_PRODUCTS_COUNT = 5;
const CREATE_PRODUCTS_MUTATION = `
  mutation populateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
      }
    }
  }
`;

export async function productCreatorBySessionId(
  sessionId,
  count = DEFAULT_PRODUCTS_COUNT,
  reportProgress = () => {}
) {
  const session = await shopify.config.sessionStorage.loadSession(sessionId);
  if (!session) throw new Error("Session not found for given sessionId");
  return productCreator(session, count, reportProgress);
}

export default async function productCreator(
  session,
  count = DEFAULT_PRODUCTS_COUNT,
  reportProgress = () => {}
) {
  const client = new shopify.api.clients.Graphql({ session });
  let created = 0;

  try {
    for (let i = 0; i < count; i++) {
      // 👇 capture response
      const res = await client.request(CREATE_PRODUCTS_MUTATION, {
        variables: { input: { title: randomTitle() } },
      });

      created++;
      const productId = res?.data?.productCreate?.product?.id;
      console.log(`[products] created product ${created}/${count}`, productId);

      // report 0..100 progress to caller (e.g. BullMQ job)
      const pct = Math.round((created / count) * 100);
      reportProgress(pct, {
        created,
        total: count,
        lastId: productId,
      });
    }

    return { created };
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
    }
    throw error;
  }
}

function randomTitle() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
}