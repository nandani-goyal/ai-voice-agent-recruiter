const { QdrantClient } = require("@qdrant/js-client-rest");

const COLLECTION_NAME = "candidate_kb";
const VECTOR_SIZE = 384; // MiniLM-L6-v2 embedding dimensions

let client = null;

const getQdrantClient = () => {
  if (!client) {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;

    if (!url) throw new Error("[Qdrant] QDRANT_URL is not set in .env");

    client = new QdrantClient({ url, apiKey });
  }
  return client;
};

/**
 * Ensures the candidate_kb collection exists.
 * Creates it with cosine similarity + 384-dim vectors if not present.
 */
const ensureCollection = async () => {
  const qdrant = getQdrantClient();

  const { collections } = await qdrant.getCollections();
  const exists = collections.some((c) => c.name === COLLECTION_NAME);

  if (!exists) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
    });
    console.log(`[Qdrant] Collection "${COLLECTION_NAME}" created.`);
  } else {
    console.log(`[Qdrant] Collection "${COLLECTION_NAME}" already exists.`);
  }
};

const getStatus = async () => {
  try {
    const qdrant = getQdrantClient();
    await qdrant.getCollections();
    return "connected";
  } catch {
    return "disconnected";
  }
};

module.exports = { getQdrantClient, ensureCollection, getStatus, COLLECTION_NAME };
