import type { Request, Response } from "express";
import { ChatService } from "./chat.service.js";
import { SendMessageDto } from "./chat.dto.js";
import { getIO } from "../../services/socket.service.js";
import { generateRoomId } from "./generateRoom.js";

const chatService = new ChatService();

export class ChatController {
    async sendMessage(req: Request, res: Response) {
        try {
            const body: any = req.body;
            const roomId = generateRoomId(req.body.senderId, req.body.receiverId);
            body.roomId = roomId;
            const message = await chatService.sendMessage(body);

            const io = getIO();

            // ✅ Emit to room (chat)
            io.to(body.roomId).emit("chat:receive", message);

            // ✅ Emit to receiver personal room (notification)
            io.to(`user-${body.receiverId}`).emit("chat:notification", {
                message: "New message received",
                data: message,
            });

            return res.json({
                success: true,
                data: message,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to send message",
            });
        }
    }

    // ✅ GET MESSAGES (CHAT HISTORY)
    async getMessages(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const messages = await chatService.getMessages(
                roomId,
                Number(page),
                Number(limit)
            );

            return res.json({
                success: true,
                data: messages,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch messages",
            });
        }
    }

}