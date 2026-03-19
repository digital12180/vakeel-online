import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
    userId: mongoose.Types.ObjectId;
    consultationId: mongoose.Types.ObjectId;

    amount: number;
    currency: string;

    stripeSessionId: string;
    stripePaymentIntentId?: string;

    status: "pending" | "success" | "failed";

    paidAt?: Date;
}

const paymentSchema = new Schema<IPayment>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    consultationId: {
        type: Schema.Types.ObjectId,
        ref: "ConsultationRequest",
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    currency: {
        type: String,
        default: "INR"
    },

    stripeSessionId: {
        type: String,
        required: true
    },

    stripePaymentIntentId: String,

    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    },

    paidAt: Date

}, { timestamps: true });

export const Payment = mongoose.model("Payment", paymentSchema);