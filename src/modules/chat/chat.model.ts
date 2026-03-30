import mongoose, { Schema, Document } from "mongoose";

export interface ChatDocument extends Document {
  roomId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: Date;
}

const ChatSchema = new Schema(
  {
    roomId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<ChatDocument>("Chat", ChatSchema);