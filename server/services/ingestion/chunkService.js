const { v4: uuidv4 } = require("uuid");

const chunkText = (documents, chunkSize = 300) => {
    const chunks = [];

    documents.forEach((doc) => {

        // Remove extra spaces/newlines
        const cleanText = doc.text.replace(/\s+/g, " ").trim();

        // Split into words
        const words = cleanText.split(" ");

        // Create chunks
        for (let i = 0; i < words.length; i += chunkSize) {

            const chunkWords = words.slice(i, i + chunkSize);

            chunks.push({
                chunkId: uuidv4(),
                source: doc.filename,
                content: chunkWords.join(" "),
                wordCount: chunkWords.length
            });
        }
    });

    return chunks;
};

module.exports = {
    chunkText
};