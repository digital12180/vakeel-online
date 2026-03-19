import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;

    title: string;
    message: string;

    type: "consultation" | "payment" | "system";

    isRead: boolean;
}

const notificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
        type: String,
        enum: ["consultation", "payment", "system"],
        default: "system"
    },

    isRead: { type: Boolean, default: false }

}, { timestamps: true });

export const Notification = mongoose.model("Notification", notificationSchema);