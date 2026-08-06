/**
 * qdrantService.js
 * Reusable Qdrant storage layer for the ingestion pipeline.
 * Uses the singleton client from config/qdrant.js.
 */

const {
  getQdrantClient,
  COLLECTION_NAME,
} = require("../config/qdrant");

const VECTOR_SIZE = 384;
const BATCH_SIZE = 100;

/**
 * Ensure the "candidate_kb" collection exists.
 * Creates it (cosine, 384-dim) only if it does not already exist.
 */
const initializeCollection = async () => {
  console.log("Initializing Qdrant...");

  const client = getQdrantClient();
  const { collections } = await client.getCollections();
  const exists = collections.some((c) => c.name === COLLECTION_NAME);

  if (exists) {
    console.log(`[Qdrant] Collection "${COLLECTION_NAME}" already exists.`);
    return;
  }

  await client.createCollection(COLLECTION_NAME, {
    vectors: {
      size: VECTOR_SIZE,
      distance: "Cosine",
    },
  });

  console.log(`[Qdrant] Collection "${COLLECTION_NAME}" created.`);
};

/**
 * Insert an array of embedded chunks into Qdrant in batches.
 * Each chunk must have: { chunkId, source, content, wordCount, embedding }
 *
 * @param {Array<{chunkId: string, source: string, content: string, wordCount: number, embedding: number[]}>} chunks
 * @returns {Promise<number>} Total number of vectors stored
 */
const storeChunks = async (chunks) => {
  const client = getQdrantClient();

  console.log("Uploading vectors...");

  let totalStored = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const points = batch.map((chunk) => ({
      id: chunk.chunkId,       // UUID string
      vector: chunk.embedding, // float32[] of length 384
      payload: {
        source: chunk.source,
        content: chunk.content,
        wordCount: chunk.wordCount,
      },
    }));

    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });

    totalStored += batch.length;
  }

  console.log("Upload complete.");
  return totalStored;
};

module.exports = { initializeCollection, storeChunks, COLLECTION_NAME };
