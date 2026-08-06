let io = null;

/**
 * Initialize Socket.IO on an existing HTTP server.
 * @param {http.Server} httpServer
 * @returns {SocketIO.Server}
 */
const initSocket = (httpServer) => {
  const { Server } = require("socket.io");

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Simple ping/pong health-check event
    socket.on("ping", (data) => {
      console.log(`[Socket.IO] ping received from ${socket.id}:`, data);
      socket.emit("pong", { message: "pong", timestamp: Date.now() });
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log("[Socket.IO] Initialized.");
  return io;
};

/** Get the active io instance (call after initSocket). */
const getIO = () => {
  if (!io) throw new Error("[Socket.IO] Not initialized. Call initSocket first.");
  return io;
};

const isRunning = () => io !== null;

module.exports = { initSocket, getIO, isRunning };
