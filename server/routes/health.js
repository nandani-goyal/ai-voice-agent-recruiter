const express = require("express");
const router = express.Router();
const { getStatus: getMongoStatus } = require("../config/db");
const { getStatus: getQdrantStatus } = require("../config/qdrant");
const { isConfigured: isGroqConfigured } = require("../config/groq");
const { isRunning: isSocketRunning } = require("../socket/socket");

router.get("/", async (req, res) => {
  const [mongoStatus, qdrantStatus] = await Promise.all([
    Promise.resolve(getMongoStatus()),
    getQdrantStatus(),
  ]);

  res.json({
    status: "ok",
    mongodb: mongoStatus,
    qdrant: qdrantStatus,
    groq: isGroqConfigured() ? "configured" : "not configured",
    socket: isSocketRunning() ? "running" : "not running",
  });
});

module.exports = router;
