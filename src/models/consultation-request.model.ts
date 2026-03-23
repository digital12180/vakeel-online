import mongoose, { Schema, Document } from "mongoose";

export interface IConsultationRequest extends Document {
    userId: mongoose.Types.ObjectId;
    fullname: string;
    email: string;
    phone: string
    category: "legal" | "finance" | "corporate";
    serviceId?: mongoose.Types.ObjectId;

    city: string;
    language: string;
    issue: string;

    professionalId?: mongoose.Types.ObjectId;

    consultationFee: number;

    status: "pending" | "assigned" | "accepted" | "rejected" | "completed" | "cancelled";

    paymentStatus: "pending" | "paid" | "failed";

    meetingLink?: string;
    contactNumber?: string;

    isActive: boolean;
}

const consultationSchema = new Schema<IConsultationRequest>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    category: { type: String, enum: ["legal", "finance", "corporate"], required: true },

    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },

    city: { type: String, required: true },
    language: { type: String, required: true },

    issue: { type: String, required: true, trim: true },

    professionalId: { type: Schema.Types.ObjectId, ref: "Professional" },

    consultationFee: { type: Number, default: 499 },

    status: {
        type: String,
        enum: ["pending", "assigned", "accepted", "rejected", "completed", "cancelled"],
        default: "pending"
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },

    meetingLink: String,
    contactNumber: String,

    isActive: { type: Boolean, default: true }

}, { timestamps: true });

consultationSchema.index({ category: 1, city: 1 });

export const ConsultationRequest = mongoose.model("ConsultationRequest", consultationSchema);