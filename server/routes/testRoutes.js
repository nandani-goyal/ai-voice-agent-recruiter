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
const { saveChunkMetadata } = require("../services/mongoService");
const { searchKnowledgeBase } = require("../services/retrievalService");
const { handleChat } = require("../controllers/chatController");

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
router.get("/test-ingestion", async (req, res) => {
  try {
    const docs = await extractAllPDFs();
    const chunks = chunkText(docs);
    const embeddedChunks = await generateEmbeddingsForChunks(chunks);

    await initializeCollection();
    const vectorsStored = await storeChunks(embeddedChunks);
    const metadataStored = await saveChunkMetadata(embeddedChunks);

    res.json({
      totalDocuments: docs.length,
      totalChunks: chunks.length,
      vectorsStored,
      metadataStored,
      collection: COLLECTION_NAME,
    });
  } catch (err) {
    console.error("[Ingestion] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// -- POST /api/retrieve ---------------------------------------------------------
router.post("/retrieve", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Query string is required" });
    }

    const results = await searchKnowledgeBase(query.trim(), 5);

    res.json({
      query: query.trim(),
      results,
    });
  } catch (err) {
    console.error("[Retrieval] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// -- POST /api/chat -------------------------------------------------------------
router.post("/chat", handleChat);

module.exports = router;
