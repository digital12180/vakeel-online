import { Server } from "socket.io";
import { getIO } from "./socket.service.js";

interface NotificationPayload {
  title: string;
  message: string;
  data?: any;
}

interface PaymentData {
  paymentId: string;
  amount: number;
  reason?: string;
}

export class NotificationService {
  private get io(): Server {
    return getIO();
  }

  // =============================================
  // 🔥 CORE SOCKET SEND METHODS
  // =============================================

  private sendToUser(userId: string, event: string, data: any): boolean {
    try {
      this.io.to(`user-${userId}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
        type: "user",
      });

      console.log(`🔔 Notification sent to user ${userId}: ${event}`);
      return true;
    } catch (error: any) {
      console.error("❌ Error sending notification to user:", error.message);
      return false;
    }
  }

  private sendToRoom(roomName: string, event: string, data: any): boolean {
    try {
      this.io.to(roomName).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
        type: "room",
      });

      console.log(`🔔 Notification sent to room ${roomName}: ${event}`);
      return true;
    } catch (error: any) {
      console.error("❌ Error sending notification to room:", error.message);
      return false;
    }
  }

  private sendToAll(event: string, data: any): boolean {
    try {
      this.io.emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
        type: "broadcast",
      });

      console.log(`📢 Broadcast notification sent: ${event}`);
      return true;
    } catch (error: any) {
      console.error("❌ Broadcast error:", error.message);
      return false;
    }
  }

  // =============================================
  // 💳 PAYMENT NOTIFICATIONS
  // =============================================

  async sendPaymentSuccess(userId: string, payment: PaymentData) {
    return this.sendToUser(userId, "payment-success", {
      title: "Payment Successful",
      message: `Your payment of ₹${payment.amount} was successful`,
      paymentId: payment.paymentId,
      amount: payment.amount,
      status: "success",
    });
  }

  async sendPaymentFailed(userId: string, payment: PaymentData) {
    return this.sendToUser(userId, "payment-failed", {
      title: "Payment Failed",
      message: `Your payment of ₹${payment.amount} failed`,
      paymentId: payment.paymentId,
      amount: payment.amount,
      status: "failed",
      reason: payment.reason || "Unknown error",
    });
  }

  // =============================================
  // 👤 USER NOTIFICATIONS
  // =============================================

  async sendRequestCreated(userId: string, name: string) {
    return this.sendToUser(userId, "request-created", {
      title: "📩 Request Submitted",
      message: `Hello ${name}, your consultation request has been submitted.`,
    });
  }

  async sendRequestAccepted(
    userId: string,
    name: string,
    professionalName: string
  ) {
    return this.sendToUser(userId, "request-accepted", {
      title: "✅ Request Accepted",
      message: `Hello ${name}, your request is accepted by ${professionalName}.`,
    });
  }

  async sendRequestRejected(userId: string, name: string) {
    return this.sendToUser(userId, "request-rejected", {
      title: "❌ Request Rejected",
      message: `Hello ${name}, your request was not accepted.`,
    });
  }

  async sendNewMessage(
    userId: string,
    receiverName: string,
    senderName: string
  ) {
    return this.sendToUser(userId, "new-message", {
      title: "💬 New Message",
      message: `${senderName} sent you a message`,
    });
  }

  async sendRequestAssigned(
    userId: string,
    userName: string,
    professionalName: string
  ) {
    return this.sendToUser(userId, "request-assigned", {
      title: "👨‍⚖️ Professional Assigned",
      message: `Hello ${userName}, your request has been assigned to ${professionalName}. They will connect with you soon.`,
    });
  }
  // =============================================
  // 👨‍⚖️ PROFESSIONAL NOTIFICATIONS
  // =============================================

  async notifyProfessional(
    professionalId: string,
    professionalName: string,
    userName: string
  ) {
    return this.sendToUser(professionalId, "new-request", {
      title: "📢 New Consultation Assigned",
      message: `Hello ${professionalName}, new request from ${userName}`,
    });
  }

  async notifyNewMessageToProfessional(
    professionalId: string,
    senderName: string
  ) {
    return this.sendToUser(professionalId, "new-message", {
      title: "💬 New Message",
      message: `You received a message from ${senderName}`,
    });
  }

  // =============================================
  // 🛠️ ADMIN NOTIFICATIONS
  // =============================================

  async notifyAdminNewRequest(userName: string) {
    return this.sendToAll("admin-new-request", {
      title: "📊 New Request Created",
      message: `User ${userName} created a new consultation request`,
    });
  }

  async notifyAdminPaymentIssue(userId: string, amount: number) {
    return this.sendToAll("admin-payment-issue", {
      title: "⚠️ Payment Issue",
      message: `Payment issue for user ${userId}, amount ₹${amount}`,
    });
  }

  // =============================================
  // 🌐 GENERAL NOTIFICATION
  // =============================================

  async sendGeneral(userId: string, payload: NotificationPayload) {
    return this.sendToUser(userId, "general-notification", {
      title: payload.title || "Notification",
      message: payload.message,
      data: payload.data || {},
    });
  }
}

// ✅ Export Singleton (IMPORTANT)
export const notificationService = new NotificationService();