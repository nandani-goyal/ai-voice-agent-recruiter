const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

const extractAllPDFs = async () => {
    const uploadFolder = path.join(__dirname, "../../uploads");

    const files = fs
        .readdirSync(uploadFolder)
        .filter(file => file.endsWith(".pdf"));

    const documents = [];

    for (const file of files) {
        const filePath = path.join(uploadFolder, file);

        const buffer = fs.readFileSync(filePath);

        const data = await pdf(buffer);

        documents.push({
            filename: file,
            text: data.text
        });
    }

    return documents;
};

module.exports = {
    extractAllPDFs
};