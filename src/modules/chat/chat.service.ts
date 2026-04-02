import Chat from "./chat.model.js";
import { SendMessageDto } from "./chat.dto.js";
import { generateRoomId } from "./generateRoom.js";

export class ChatService {
    async sendMessage(data: SendMessageDto) {
        const { senderId, receiverId, message } = data;

        const roomId = generateRoomId(senderId, receiverId);

        const chat = await Chat.create({
            senderId,
            receiverId,
            message,
            roomId,
        });

        return chat;
    }

    async getMessages(roomId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const messages = await Chat.find({ roomId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return messages.reverse();
    }
}

