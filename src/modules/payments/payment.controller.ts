// // controllers/payment.controller.ts

// import type { Request, Response } from "express";
// import {
//     createPaymentIntentService,
//     updatePaymentStatusService,
//     retryPaymentService,
//     getPaymentHistoryService
// } from "./payment.service.js";
// import { stripe } from "../../config/stripe.js";

// export const createPaymentIntent = async (req: Request, res: Response) => {
//     try {
//         const { userId, consultationId, amount } = req.body;

//         const result = await createPaymentIntentService(
//             userId,
//             consultationId,
//             amount
//         );

//         res.status(200).json({
//             success: true,
//             message: "Payment intent created",
//             data: result,
//         });
//     } catch (error: any) {
//         res.status(error.statusCode || 500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// // 🔔 Stripe Webhook Controller
// export const stripeWebhook = async (req: Request, res: Response) => {
//     const sig = req.headers["stripe-signature"] as string;

//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(
//             req.body,
//             sig,
//             process.env.STRIPE_WEBHOOK_SECRET!
//         );
//     } catch (err: any) {
//         return res.status(400).json({
//             success: false,
//             message: `Webhook Error: ${err.message}`,
//         });
//     }

//     try {
//         switch (event.type) {
//             case "payment_intent.succeeded":
//                 const successIntent = event.data.object as any;

//                 await updatePaymentStatusService(
//                     successIntent.id,
//                     "success"
//                 );

//                 break;

//             case "payment_intent.payment_failed":
//                 const failedIntent = event.data.object as any;

//                 await updatePaymentStatusService(
//                     failedIntent.id,
//                     "failed"
//                 );

//                 break;
//         }

//         res.json({ received: true });
//     } catch (error: any) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };

// export const retryPayment = async (req: Request, res: Response) => {
//     try {
//         const { paymentId } = req.body;

//         if (!paymentId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "paymentId is required",
//             });
//         }

//         const result = await retryPaymentService(paymentId);

//         res.json({
//             success: true,
//             message: "Retry payment created",
//             data: result,
//         });
//     } catch (error: any) {
//         res.status(error.statusCode || 500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// };


// export const getPaymentHistory = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;
//     const { page = "1", limit = "10", status } = req.query;

//     const result = await getPaymentHistoryService(
//       userId,
//       parseInt(page as string),
//       parseInt(limit as string),
//       status as string
//     );

//     res.json({
//       success: true,
//       data: result,
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



