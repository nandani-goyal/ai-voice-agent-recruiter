/**
 * embeddingService.js
 * Generates sentence embeddings using @xenova/transformers (runs locally, no API call).
 * Model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (384 dimensions)
 *
 * Singleton pattern — model is loaded only once per server lifecycle.
 */

const MODEL_NAME =
  "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2";

const EMBEDDING_DIM = 384;

let _embedder = null;

/**
 * Load (or return cached) embedding pipeline.
 */
const loadModel = async () => {
  if (_embedder) return _embedder;

  console.log("Loading embedding model...");

  const { pipeline, env } = await import("@xenova/transformers");
  env.cacheDir = "./models";

  _embedder = await pipeline("feature-extraction", MODEL_NAME, {
    quantized: false,
  });

  console.log("Model loaded.");
  return _embedder;
};

/**
 * Generate a 384-dimensional embedding vector for a single text string.
 */
const generateEmbedding = async (text) => {
  const embedder = await loadModel();
  const output = await embedder(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
};

/**
 * Generate embeddings for every chunk in the array.
 */
const generateEmbeddingsForChunks = async (chunks) => {
  console.log("Generating embeddings...");

  const results = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await generateEmbedding(chunk.content);

    console.log(`Embedding generated for chunk ${i + 1}`);
    console.log(`Embedding dimension: ${embedding.length}`);

    results.push({
      chunkId: chunk.chunkId,
      source: chunk.source,
      content: chunk.content,
      wordCount: chunk.wordCount,
      embedding,
    });
  }

  return results;
};

module.exports = {
  loadModel,
  generateEmbedding,
  generateEmbeddingsForChunks,
  EMBEDDING_DIM,
};
