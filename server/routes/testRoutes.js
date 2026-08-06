const express = require("express");
const router = express.Router();

const { extractAllPDFs } = require("../services/ingestion/pdfService");
const { chunkText } = require("../services/ingestion/chunkService");
const {
  generateEmbeddingsForChunks,
  EMBEDDING_DIM,
} = require("../services/ingestion/embeddingService");
const {
  initializeCollection,
  storeChunks,
  COLLECTION_NAME,
} = require("../services/qdrantService");

// -- GET /api/test-chunks -------------------------------------------------------
router.get("/test-chunks", async (req, res) => {
  try {
    const docs = await extractAllPDFs();
    const chunks = chunkText(docs);

    console.log("Total Chunks:", chunks.length);

    chunks.forEach((chunk, index) => {
      console.log("\n-------------------------");
      console.log("Chunk:", index + 1);
      console.log("Source:", chunk.source);
      console.log("Words:", chunk.wordCount);
      console.log(chunk.content.substring(0, 200));
    });

    res.json({ totalChunks: chunks.length, chunks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- GET /api/test-embeddings ---------------------------------------------------
router.get("/test-embeddings", async (req, res) => {
  try {
    const docs = await extractAllPDFs();
    const chunks = chunkText(docs);
    const embeddedChunks = await generateEmbeddingsForChunks(chunks);

    const sample = embeddedChunks[0];
    const sampleChunk = sample
      ? {
          chunkId: sample.chunkId,
          source: sample.source,
          wordCount: sample.wordCount,
          embeddingDimension: sample.embedding.length,
        }
      : null;

    res.json({
      totalChunks: embeddedChunks.length,
      embeddingDimension: EMBEDDING_DIM,
      sampleChunk,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -- GET /api/test-ingestion ----------------------------------------------------
// Full ingestion pipeline: Read PDFs -> Extract -> Chunk -> Embed -> Store in Qdrant
router.get("/test-ingestion", async (req, res) => {
  try {
    // 1. Read PDFs & Extract text
    const docs = await extractAllPDFs();

    // 2. Chunk text (~300 words)
    const chunks = chunkText(docs);

    // 3. Generate embeddings
    const embeddedChunks = await generateEmbeddingsForChunks(chunks);

    // 4. Initialize Qdrant collection if not exists
    await initializeCollection();

    // 5. Batch insert vectors into Qdrant
    const vectorsStored = await storeChunks(embeddedChunks);

    // 6. Return response
    res.json({
      totalDocuments: docs.length,
      totalChunks: chunks.length,
      vectorsStored,
      collection: COLLECTION_NAME,
    });
  } catch (err) {
    console.error("[Ingestion] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
