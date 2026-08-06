const KnowledgeDocument = require("../models/KnowledgeDocument");

/**
 * Save metadata for an array of chunks into MongoDB.
 * Does NOT store embedding vectors or full text content.
 * Prevents duplicate inserts using chunkId upserts via bulkWrite.
 *
 * @param {Array<{chunkId: string, source: string, documentName?: string, wordCount: number}>} chunks
 * @returns {Promise<number>} Count of metadata records stored/upserted
 */
const saveChunkMetadata = async (chunks) => {
  if (!chunks || chunks.length === 0) return 0;

  console.log("Saving metadata...");

  const operations = chunks.map((chunk) => ({
    updateOne: {
      filter: { chunkId: chunk.chunkId },
      update: {
        $setOnInsert: {
          chunkId: chunk.chunkId,
          source: chunk.source,
          documentName: chunk.documentName || chunk.source,
          wordCount: chunk.wordCount,
          ingestionStatus: "completed",
          createdAt: new Date(),
        },
      },
      upsert: true,
    },
  }));

  const result = await KnowledgeDocument.bulkWrite(operations);
  const storedCount = (result.upsertedCount || 0) + (result.modifiedCount || 0) + (result.matchedCount || 0);

  console.log(`${chunks.length} metadata records stored.`);
  return chunks.length;
};

module.exports = {
  saveChunkMetadata,
};
