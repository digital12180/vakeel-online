import { Server, Socket } from "socket.io";

export const initSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("✅ User connected:", socket.id);

    // Join room
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    // Send message
    socket.on("send_message", (data) => {
      const { roomId, message, sender } = data;

      io.to(roomId).emit("receive_message", {
        message,
        sender,
        createdAt: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
    });
  });
};