// services/payment.service.ts
import { Payment } from "../../models/payment.model.js";
import { stripe } from "../../config/stripe.js";
import { ApiError } from "../../utils/apiError.js";

export const createPaymentIntentService = async (
  userId: string,
  consultationId: string,
  amount: number
) => {
  try {
    // 🔍 Check duplicate payment for same consultation
    const existingPayment = await Payment.findOne({
      consultationId,
      status: "success",
    });

    if (existingPayment) {
      throw new ApiError(400,"Payment already completed for this consultation");
    }

    // 💳 Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: "inr",
      metadata: {
        userId,
        consultationId,
      },
    });

    // 💾 Save in DB
    const payment = await Payment.create({
      userId,
      consultationId,
      amount,
      currency: "INR",
      stripeSessionId: paymentIntent.id, // using as sessionId
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    };
  } catch (error: any) {
    throw new ApiError(500,error.message);
  }
};

// 🔄 Update Payment Status (Webhook)
export const updatePaymentStatusService = async (
  stripePaymentIntentId: string,
  status: "success" | "failed"
) => {
  const payment = await Payment.findOne({
    stripePaymentIntentId,
  });

  if (!payment) {
    throw new ApiError(404,"Payment not found");
  }

  // 🔐 Prevent duplicate success handling
  if (payment.status === "success") {
    return payment;
  }

  payment.status = status;

  if (status === "success") {
    payment.paidAt = new Date();
  }

  await payment.save();

  return payment;
};

export const retryPaymentService = async (paymentId: string) => {
  // 1. Find old payment
  const oldPayment = await Payment.findById(paymentId);

  if (!oldPayment) {
    throw new ApiError(404,"Payment not found");
  }

  // 2. Prevent retry if already success
  if (oldPayment.status === "success") {
    throw new ApiError(400,"Payment already successful");
  }

  // 3. Limit retries (important for abuse protection)
  if (oldPayment.retryCount >= 3) {
    throw new ApiError(400,"Retry limit exceeded");
  }

  // 4. Create new PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: oldPayment.amount * 100,
    currency: "inr",
    metadata: {
      userId: oldPayment.userId.toString(),
      consultationId: oldPayment.consultationId.toString(),
    },
  });

  // 5. Create new payment record
  const newPayment = await Payment.create({
    userId: oldPayment.userId,
    consultationId: oldPayment.consultationId,
    amount: oldPayment.amount,
    currency: oldPayment.currency,
    stripeSessionId: paymentIntent.id,
    stripePaymentIntentId: paymentIntent.id,
    status: "pending",
    retryCount: oldPayment.retryCount + 1,
    parentPaymentId: oldPayment._id,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: newPayment._id,
  };
};

// services/payment.service.ts

export const getPaymentHistoryService = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string
) => {
  const query: any = { userId };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(limit)
      .lean(),

    Payment.countDocuments(query),
  ]);

  return {
    payments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};