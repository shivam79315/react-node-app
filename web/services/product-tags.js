import shopify from "../db/shopify.js";
import { GraphqlQueryError } from "@shopify/shopify-api";

const BULK_PRODUCTS_QUERY = `
  query getProducts($cursor: String) {
    products(first: 100, after: $cursor) {
      edges {
        node {
          id
          tags
        }
        cursor
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const UPDATE_TAGS_MUTATION = `
  mutation updateProductTags($id: ID!, $tags: [String!]) {
    productUpdate(input: { id: $id, tags: $tags }) {
      product { id }
      userErrors { field, message }
    }
  }
`;

export async function addTagsToAllProducts(sessionId, newTags, reportProgress = () => {}) {
  const session = await shopify.config.sessionStorage.loadSession(sessionId);
  if (!session) throw new Error("Session not found for given sessionId");

  const client = new shopify.api.clients.Graphql({ session });

  let cursor = null;
  let processed = 0;
  let updated = 0;
  let total = 0;

  try {
    let hasNext = true;

    // Count total first
    const countRes = await client.request(`
      { productsCount { count } }
    `);
    total = countRes.data.productsCount.count;

    while (hasNext) {
      const res = await client.request(BULK_PRODUCTS_QUERY, { variables: { cursor } });

      const edges = res.data.products.edges;
      hasNext = res.data.products.pageInfo.hasNextPage;
      cursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

      for (const { node } of edges) {
        processed++;
        const mergedTags = Array.from(new Set([...(node.tags || []), ...newTags]));

        await client.request(UPDATE_TAGS_MUTATION, {
          variables: { id: node.id, tags: mergedTags },
        });

        updated++;
        const pct = Math.round((processed / total) * 100);
        reportProgress(pct, { processed, updated, total });
      }
    }

    return { updated, total };
  } catch (error) {
    if (error instanceof GraphqlQueryError) {
      throw new Error(`${error.message}\n${JSON.stringify(error.response, null, 2)}`);
    }
    throw error;
  }
}