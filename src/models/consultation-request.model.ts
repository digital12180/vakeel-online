import mongoose, { Schema, Document } from "mongoose";

export interface IConsultationRequest extends Document {
    userId: mongoose.Types.ObjectId;

    // Step 1 fields
    category: "legal" | "finance" | "corporate";
    city: string;
    language: string;
    issue: string;

    // Step 3 (assigned later)
    professionalId?: mongoose.Types.ObjectId;

    // Step 2 (payment first)
    consultationFee: number;
    paymentStatus: "pending" | "paid" | "failed";

    // Step 4 (flow status)
    status: "pending" | "assigned" | "accepted" | "rejected" | "completed";

    // Meeting / contact
    meetingLink?: string;
    contactNumber?: string;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const consultationSchema = new Schema<IConsultationRequest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category: {
            type: String,
            enum: ["legal", "finance", "corporate"],
            required: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        language: {
            type: String,
            required: true,
        },

        issue: {
            type: String,
            required: true,
            trim: true,
        },

        professionalId: {
            type: Schema.Types.ObjectId,
            ref: "Professional",
        },

        consultationFee: {
            type: Number,
            default: 499,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        status: {
            type: String,
            enum: ["pending", "assigned", "accepted", "rejected", "completed"],
            default: "pending",
        },

        meetingLink: String,
        contactNumber: String,

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const ConsultationRequest = mongoose.model(
    "ConsultationRequest",
    consultationSchema
);