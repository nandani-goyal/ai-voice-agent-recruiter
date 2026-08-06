exports.uploadDocument = (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded"
        });
    }

    res.status(200).json({
        message: "Document uploaded successfully",
        filename: req.file.filename
    });

};