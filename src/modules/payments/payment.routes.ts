// // routes/payment.routes.ts

// import express from "express";
// import {
//     createPaymentIntent,
//     stripeWebhook,
//     retryPayment,
//     getPaymentHistory
// } from "./payment.controller.js";
// import { verifyToken, userOnly,adminOnly } from "../../middlewares/auth.middleware.js";
// import { validateCreatePayment } from "../../middlewares/validation.middleware.js";

// const router = express.Router();

// router.post("/create", verifyToken, validateCreatePayment, createPaymentIntent);

// // // ⚠️ webhook must use raw body
// // router.post(
// //     "/webhook",
// //     verifyToken,
// //     stripeWebhook
// // );
// router.post("/retry",verifyToken,userOnly, retryPayment);
// router.get("/history/:userId",verifyToken,adminOnly, getPaymentHistory);

// export default router;

// routes/payment.routes.ts

import { Router } from "express";
import { PaymentController } from "./payment.controller.js";

// (Optional) Auth middleware
import { verifyToken, adminOnly } from "../../middlewares/auth.middleware.js";
const router = Router();

/**
 * @route   POST /api/payment/create
 * @desc    Create Razorpay order
 */
router.post(
    "/create",
    verifyToken,
    PaymentController.create
);

/**
 * @route   POST /api/payment/verify
 * @desc    Verify Razorpay payment
 */
router.post(
    "/verify",
    verifyToken,
    PaymentController.verify
);

/**
 * @route   POST /api/payment/failed
 * @desc    Handle failed payment
 */
router.post(
    "/failed",
    verifyToken,
    PaymentController.failed
);

/**
 * @route   POST /api/payment/retry
 * @desc    Retry payment
 */
router.post(
    "/retry",
    verifyToken,
    PaymentController.retry
);

/**
 * @route   GET /api/payment/history
 * @desc    Get user payment history
 */
router.get(
    "/history",
    verifyToken,
    // adminOnly,
    PaymentController.history
);

router.get('/all-history',
    verifyToken,
    adminOnly,
    PaymentController.getHistoryByAdmin
)

export default router;