require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");

const { connectDB } = require("./config/db");
const { ensureCollection } = require("./config/qdrant");
const { initSocket } = require("./socket/socket");

const healthRouter = require("./routes/health");

const app = express();
const server = http.createServer(app);
const uploadRoutes = require("./routes/uploadRoutes");
const testRoutes = require("./routes/testRoutes");

app.use("/api", testRoutes);
app.use("/api", uploadRoutes);

// -- Middleware -----------------------------------------------------------------
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

// -- Routes --------------------------------------------------------------------
app.get("/", (req, res) => res.send("Recruit AI Backend Running"));
app.use("/health", healthRouter);

// -- Bootstrap -----------------------------------------------------------------
const PORT = process.env.PORT || 5000;

const start = async () => {
  // 1. MongoDB
  await connectDB();

  // 2. Qdrant collection
  try {
    await ensureCollection();
  } catch (err) {
    console.warn(`[Qdrant] Skipped collection setup: ${err.message}`);
  }

  // 3. Socket.IO
  initSocket(server);

  // 4. Listen
  server.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
};

start();
