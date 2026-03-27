// dtos/payment.dto.ts

// ✅ Create Payment
export interface CreatePaymentDto {
  amount: number;
  purpose: string;
}

// ✅ Verify Payment
export interface VerifyPaymentDto {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  paymentId: string;
}

// ✅ Retry Payment
export interface RetryPaymentDto {
  paymentId: string;
}

// ✅ Failed Payment
export interface FailedPaymentDto {
  paymentId: string;
  reason: string;
}