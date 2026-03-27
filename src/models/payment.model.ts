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

/**
 * Enum for Payment Status
 */
export enum PaymentStatus {
  INITIALIZE = "INITIALIZE",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

/**
 * Interface for Payment Document
 */
export interface IPayment extends Document {
  userId: Types.ObjectId;
  orderId: string; // Razorpay order id
  paymentId?: string;
  signature?: string;
  amount: number;
  purpose: string; // 🔥 NEW (why payment is done)
  status: PaymentStatus;
  failureReason?: string;

  // 🔥 retry + protection
  retryCount: number;
  isLocked: boolean;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payment Schema
 */
const paymentSchema: Schema<IPayment> = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true, // 🔥 prevent duplicate orders
    },

    paymentId: {
      type: String,
    },

    signature: {
      type: String,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    purpose: {
      type: String,
      required: true, // e.g. CONSULTATION_FEE
    },

    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.INITIALIZE,
    },

    failureReason: {
      type: String,
    },

    retryCount: {
      type: Number,
      default: 0,
    },

    isLocked: {
      type: Boolean,
      default: false, // once paid → lock
    },
  },
  { timestamps: true }
);

/**
 * Index for fast queries (production 🔥)
 */
paymentSchema.index({ userId: 1, createdAt: -1 });

/**
 * Export Model
 */
export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);