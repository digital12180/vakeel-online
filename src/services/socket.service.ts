import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";

interface CustomSocket extends Socket {
  userId?: string;
}

let io: Server;

const initializeSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // ✅ Middleware for authentication
  io.use((socket: CustomSocket, next) => {
    const userId =
      socket.handshake.auth?.userId ||
      socket.handshake.query?.userId ||
      socket.handshake.headers?.userid;

    if (!userId || typeof userId !== "string") {
      return next(new Error("Authentication Error"));
    }

    socket.userId = userId;
    next();
  });

  io.on("connection", (socket: CustomSocket) => {
    console.log(`User connected: ${socket.id}`);

    // ✅ Store user connection
    if (socket.userId) {
      const userId = socket.userId;
      socket.join(`user-${userId}`);
      console.log(`User ${userId} mapped to socket ${socket.id}`);
    }

    // ✅ Join room
    socket.on("join-room", (roomName: string) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    // ✅ Leave room
    socket.on("leave-room", (roomName: string) => {
      socket.leave(roomName);
      console.log(`Socket ${socket.id} left room: ${roomName}`);
    });

    // ✅ Disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export { initializeSocket, getIO };