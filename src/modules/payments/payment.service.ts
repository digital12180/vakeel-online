// // services/payment.service.ts
// import { Payment } from "../../models/payment.model.js";
// import { stripe } from "../../config/stripe.js";
// import { ApiError } from "../../utils/apiError.js";

// export const createPaymentIntentService = async (
//   userId: string,
//   consultationId: string,
//   amount: number
// ) => {
//   try {
//     // 🔍 Check duplicate payment for same consultation
//     const existingPayment = await Payment.findOne({
//       consultationId,
//       status: "success",
//     });

//     if (existingPayment) {
//       throw new ApiError(400,"Payment already completed for this consultation");
//     }

//     // 💳 Create Stripe PaymentIntent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: amount * 100,
//       currency: "inr",
//       metadata: {
//         userId,
//         consultationId,
//       },
//     });

//     // 💾 Save in DB
//     const payment = await Payment.create({
//       userId,
//       consultationId,
//       amount,
//       currency: "INR",
//       stripeSessionId: paymentIntent.id, // using as sessionId
//       stripePaymentIntentId: paymentIntent.id,
//       status: "pending",
//     });

//     return {
//       clientSecret: paymentIntent.client_secret,
//       paymentId: payment._id,
//     };
//   } catch (error: any) {
//     throw new ApiError(500,error.message);
//   }
// };

// // 🔄 Update Payment Status (Webhook)
// export const updatePaymentStatusService = async (
//   stripePaymentIntentId: string,
//   status: "success" | "failed"
// ) => {
//   const payment = await Payment.findOne({
//     stripePaymentIntentId,
//   });

//   if (!payment) {
//     throw new ApiError(404,"Payment not found");
//   }

//   // 🔐 Prevent duplicate success handling
//   if (payment.status === "success") {
//     return payment;
//   }

//   payment.status = status;

//   if (status === "success") {
//     payment.paidAt = new Date();
//   }

//   await payment.save();

//   return payment;
// };

// export const retryPaymentService = async (paymentId: string) => {
//   // 1. Find old payment
//   const oldPayment = await Payment.findById(paymentId);

//   if (!oldPayment) {
//     throw new ApiError(404,"Payment not found");
//   }

//   // 2. Prevent retry if already success
//   if (oldPayment.status === "success") {
//     throw new ApiError(400,"Payment already successful");
//   }

//   // 3. Limit retries (important for abuse protection)
//   if (oldPayment.retryCount >= 3) {
//     throw new ApiError(400,"Retry limit exceeded");
//   }

//   // 4. Create new PaymentIntent
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: oldPayment.amount * 100,
//     currency: "inr",
//     metadata: {
//       userId: oldPayment.userId.toString(),
//       consultationId: oldPayment.consultationId.toString(),
//     },
//   });

//   // 5. Create new payment record
//   const newPayment = await Payment.create({
//     userId: oldPayment.userId,
//     consultationId: oldPayment.consultationId,
//     amount: oldPayment.amount,
//     currency: oldPayment.currency,
//     stripeSessionId: paymentIntent.id,
//     stripePaymentIntentId: paymentIntent.id,
//     status: "pending",
//     retryCount: oldPayment.retryCount + 1,
//     parentPaymentId: oldPayment._id,
//   });

//   return {
//     clientSecret: paymentIntent.client_secret,
//     paymentId: newPayment._id,
//   };
// };

// // services/payment.service.ts

// export const getPaymentHistoryService = async (
//   userId: string,
//   page: number = 1,
//   limit: number = 10,
//   status?: string
// ) => {
//   const query: any = { userId };

//   if (status) {
//     query.status = status;
//   }

//   const skip = (page - 1) * limit;

//   const [payments, total] = await Promise.all([
//     Payment.find(query)
//       .sort({ createdAt: -1 }) // latest first
//       .skip(skip)
//       .limit(limit)
//       .lean(),

//     Payment.countDocuments(query),
//   ]);

//   return {
//     payments,
//     pagination: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// };

// services/payment.service.ts

import mongoose from "mongoose";
import crypto from "crypto";
import { Payment, PaymentStatus } from "../../models/payment.model.js";
import Razorpay from "razorpay";
import { ApiError } from "../../utils/apiError.js";
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export class PaymentService {

  // ✅ CREATE PAYMENT
  static async createPayment(userId: string, amount: number, purpose: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      const payment = await Payment.create([{
        userId,
        orderId: order.id,
        amount,
        purpose,
        status: PaymentStatus.INITIALIZE,
      }], { session });

      await session.commitTransaction();

      return {
        order,
        payment: payment[0],
      };

    } catch (error) {
      await session.abortTransaction();
      throw new ApiError(500, "Payment creation failed");
    } finally {
      session.endSession();
    }
  }

  // ✅ VERIFY PAYMENT
  static async verifyPayment(data: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findById(data.paymentId).session(session);
      if (!payment) throw new ApiError(400, "Payment not found");

      if (payment.status === PaymentStatus.PAID) {
        return { message: "Already paid" };
      }

      const body = data.razorpay_order_id + "|" + data.razorpay_payment_id;

      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET!)
        .update(body)
        .digest("hex");

      if (expectedSignature !== data.razorpay_signature) {
        payment.status = PaymentStatus.FAILED;
        await payment.save({ session });
        throw new ApiError(400, "Invalid signature");
      }

      payment.status = PaymentStatus.PAID;
      payment.paymentId = data.razorpay_payment_id;
      payment.signature = data.razorpay_signature;
      payment.isLocked = true;

      await payment.save({ session });

      await session.commitTransaction();

      return payment;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ❌ PAYMENT FAILED
  static async paymentFailed(paymentId: string, reason: string) {
    const payment = await Payment.findById(paymentId);

    if (!payment) throw new ApiError(400, "Payment not found");

    if (payment.status === PaymentStatus.PAID) {
      return { message: "Already paid" };
    }

    payment.status = PaymentStatus.FAILED;
    payment.failureReason = reason;
    payment.retryCount += 1;

    await payment.save();

    return payment;
  }

  // 🔁 RETRY PAYMENT
  static async retryPayment(paymentId: string) {
    const payment = await Payment.findById(paymentId);

    if (!payment) throw new ApiError(400, "Payment not found");

    if (payment.isLocked) {
      throw new ApiError(409, "Payment already completed");
    }

    if (payment.retryCount >= 3) {
      throw new ApiError(400, "Max retries reached");
    }

    const newOrder = await razorpay.orders.create({
      amount: payment.amount * 100,
      currency: "INR",
    });

    payment.orderId = newOrder.id;
    payment.status = PaymentStatus.INITIALIZE;

    await payment.save();

    return newOrder;
  }

  // 📜 PAYMENT HISTORY
  static async getHistory(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const data = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ userId });

    return { total, data };
  }


  static async getHisotryByAdmin(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const data = await Payment.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments();

    return { total, data };
  }
}