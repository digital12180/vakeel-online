// import mongoose, { Schema, Document } from "mongoose";

// export interface IPayment extends Document {

//     userId: mongoose.Types.ObjectId;
//     consultationId: mongoose.Types.ObjectId;

//     amount: number;
//     currency: string;

//     stripeSessionId: string;
//     stripePaymentIntentId?: string;

//     status: "pending" | "success" | "failed";

//     paidAt?: Date;
//     retryCount:number;
//     parentPaymentId:mongoose.Types.ObjectId;
// }
// // models/payment.model.t

// const paymentSchema = new Schema<IPayment>({
//     userId: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//         required: true
//     },

//     consultationId: {
//         type: Schema.Types.ObjectId,
//         ref: "ConsultationRequest",
//         required: true
//     },

//     amount: {
//         type: Number,
//         required: true
//     },

//     currency: {
//         type: String,
//         default: "INR"
//     },

//     stripeSessionId: {
//         type: String,
//         required: true
//     },

//     stripePaymentIntentId: String,

//     status: {
//         type: String,
//         enum: ["pending", "success", "failed"],
//         default: "pending"
//     },

//     paidAt: Date,
//     retryCount: {
//         type: Number,
//         default: 0
//     },

//     parentPaymentId: {
//         type: Schema.Types.ObjectId,
//         ref: "Payment"
//     }
// }, { timestamps: true });

// export const Payment = mongoose.model("Payment", paymentSchema);

import mongoose, { Schema, Document, Types } from "mongoose";

export enum PaymentStatus {
  INITIALIZE = "INITIALIZE",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface IPayment extends Document {
  userId: Types.ObjectId;

  // 🔥 NEW
  professionalId?: Types.ObjectId | null;
  type: "professional" | "global";

  orderId: string;
  paymentId?: string;
  signature?: string;

  amount: number;
  purpose: string;

  status: PaymentStatus;
  failureReason?: string;

  retryCount: number;
  isLocked: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema: Schema<IPayment> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🔥 NEW FIELD
    professionalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional",
      default: null,
    },

    // 🔥 NEW FIELD
    type: {
      type: String,
      enum: ["professional", "global"],
      required: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: String,
    signature: String,

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    purpose: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.INITIALIZE,
    },

    failureReason: String,

    retryCount: {
      type: Number,
      default: 0,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔥 IMPORTANT INDEX (for fast payment checks)
paymentSchema.index({ userId: 1, professionalId: 1, type: 1, status: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);