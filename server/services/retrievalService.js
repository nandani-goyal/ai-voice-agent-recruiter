const { generateEmbedding } = require("./ingestion/embeddingService");
const { getQdrantClient, COLLECTION_NAME } = require("../config/qdrant");

/**
 * Search the Qdrant candidate_kb collection using cosine similarity.
 *
 * @param {string} query - User search query
 * @param {number} [topK=5] - Number of top results to return
 * @returns {Promise<Array<{score: number, source: string, content: string, wordCount: number}>>}
 */
const searchKnowledgeBase = async (query, topK = 5) => {
  if (!query || typeof query !== "string" || !query.trim()) {
    throw new Error("A valid query string is required");
  }

  // 1. Generate embedding for query using MiniLM (384 dimensions)
  const queryVector = await generateEmbedding(query);

  // 2. Search Qdrant collection
  const client = getQdrantClient();
  const searchHits = await client.search(COLLECTION_NAME, {
    vector: queryVector,
    limit: topK,
    with_payload: true,
  });

  // 3. Format hits into result objects
  const results = searchHits.map((hit) => ({
    score: hit.score,
    source: hit.payload?.source || "",
    content: hit.payload?.content || "",
    wordCount: hit.payload?.wordCount || 0,
  }));

  return results;
};

module.exports = {
  searchKnowledgeBase,
};
