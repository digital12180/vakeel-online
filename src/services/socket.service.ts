// import { Server as HTTPServer } from "http";
// import { Server, Socket } from "socket.io";

// interface CustomSocket extends Socket {
//   userId?: string;
// }

// let io: Server;

// const initializeSocket = (server: HTTPServer): Server => {
//   io = new Server(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//       credentials: true,
//     },
//     transports: ["websocket", "polling"],
//   });

//   // ✅ Middleware for authentication
//   io.use((socket: CustomSocket, next) => {
//     const userId =
//       socket.handshake.auth?.userId ||
//       socket.handshake.query?.userId ||
//       socket.handshake.headers?.userid;

//     if (!userId || typeof userId !== "string") {
//       return next(new Error("Authentication Error"));
//     }

//     socket.userId = userId;
//     next();
//   });

//   io.on("connection", (socket: CustomSocket) => {
//     console.log(`User connected: ${socket.id}`);

//     // ✅ Store user connection
//     if (socket.userId) {
//       const userId = socket.userId;
//       socket.join(`user-${userId}`);
//       console.log(`User ${userId} mapped to socket ${socket.id}`);
//     }

//     // ✅ Join room
//     socket.on("join-room", (roomName: string) => {
//       socket.join(roomName);
//       console.log(`Socket ${socket.id} joined room: ${roomName}`);
//     });

//     // ✅ Leave room
//     socket.on("leave-room", (roomName: string) => {
//       socket.leave(roomName);
//       console.log(`Socket ${socket.id} left room: ${roomName}`);
//     });

//     // ✅ Disconnect
//     socket.on("disconnect", () => {
//       console.log(`User disconnected: ${socket.id}`);
//     });
//   });

//   return io;
// };

// const getIO = (): Server => {
//   if (!io) {
//     throw new Error("Socket.io not initialized");
//   }
//   return io;
// };

// export { initializeSocket, getIO };


import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { ChatService } from "../modules/chat/chat.service.js";
import { generateRoomId } from "../modules/chat/generateRoom.js";

interface CustomSocket extends Socket {
  userId?: string;
}

let io: Server;
const chatService = new ChatService();

export const initializeSocket = (server: HTTPServer): Server => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // ✅ Auth Middleware
  io.use((socket: CustomSocket, next) => {
    console.log("Auth Data:", socket.handshake.auth);

    const userId = socket.handshake.auth?.userId;

    if (!userId) {
      return next(new Error("Unauthorized"));
    }

    socket.userId = userId;
    next();
  });

  io.on("connection", (socket: CustomSocket) => {
    console.log("User connected:", socket.userId);

    // ✅ Join personal room
    socket.join(`user-${socket.userId}`);

    /**
     * ✅ JOIN CHAT ROOM
     */
    socket.on("join-chat", ({ receiverId }) => {
      const roomId = generateRoomId(socket.userId!, receiverId);
      socket.join(roomId);

      console.log(`${socket.userId} joined ${roomId}`);
    });

    /**
     * ✅ SEND MESSAGE
     */
    socket.on("send-message", async (data) => {
      try {
        const savedMessage = await chatService.sendMessage(data);

        const roomId = generateRoomId(
          data.senderId,
          data.receiverId
        );

        // 🔥 send to chat room
        io.to(roomId).emit("receive-message", savedMessage);

        // 🔔 notification
        io.to(`user-${data.receiverId}`).emit("new-message", {
          message: "New message received",
          data: savedMessage,
        });

      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};