import Chat from "./chat.model.js";
import { SendMessageDto } from "./chat.dto.js";

export class ChatService {
    async sendMessage(data: SendMessageDto) {
        const chat = await Chat.create(data);
        return chat;
    }

    // ✅ Get all messages of a room
    async getMessages(roomId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const messages = await Chat.find({ roomId })
            .sort({ createdAt: -1 }) // latest first
            .skip(skip)
            .limit(limit);

        return messages.reverse(); // oldest → newest for UI
    }
}