const express = require("express");

const router = express.Router();

const {
    extractAllPDFs
} = require("../services/ingestion/pdfService");

router.get("/test-pdfs", async (req, res) => {

    try {

        const docs = await extractAllPDFs();

        docs.forEach(doc => {

            console.log("\n=========================");
            console.log(doc.filename);
            console.log("=========================");

            console.log(doc.text.substring(0,500));

        });

        res.json(docs);

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

});

module.exports = router;