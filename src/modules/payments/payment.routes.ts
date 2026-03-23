// routes/payment.routes.ts

import express from "express";
import {
    createPaymentIntent,
    stripeWebhook,
    retryPayment,
    getPaymentHistory
} from "./payment.controller.js";
import { verifyToken, userOnly,adminOnly } from "../../middlewares/auth.middleware.js";
import { validateCreatePayment } from "../../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/create", verifyToken, validateCreatePayment, createPaymentIntent);

// ⚠️ webhook must use raw body
router.post(
    "/webhook",
    verifyToken,
    stripeWebhook
);
router.post("/retry",verifyToken,userOnly, retryPayment);
router.get("/history/:userId",verifyToken,adminOnly, getPaymentHistory);

export default router;