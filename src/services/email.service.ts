import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Email service ready");
    } catch (error: any) {
      console.error("❌ Email connection failed:", error.message);
    }
  }

  // =============================================
  // 📩 GENERIC SEND EMAIL
  // =============================================
  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: `"Vakeel App" <${process.env.EMAIL}>`,
        to,
        subject,
        html,
      });

      console.log(`📧 Email sent to ${to}`);
      return true;
    } catch (error: any) {
      console.error("❌ Email send error:", error.message);
      return false;
    }
  }

  // =============================================
  // 📨 1. REQUEST CREATED
  // =============================================
  async sendRequestCreated(email: string, name: string) {
    return this.sendEmail(
      email,
      "📩 Consultation Request Submitted",
      `
      <h2>Hello ${name},</h2>
      <p>Your consultation request has been successfully submitted.</p>
      <p>Our team will assign a professional shortly.</p>
      <br/>
      <p>Thanks,<br/>Vakeel Team</p>
      `
    );
  }

 async sendRequestToProfessional(email: string, name: string) {
  return this.sendEmail(
    email,
    "📩 Consultation Request Submitted",
    `
    <h2>Hello ${name},</h2>
    <p>Your consultation request has been successfully submitted.</p>
    <p>A professional will review your request and respond shortly.</p>
    <br/>
    <p>Thank you for using Vakeel.</p>
    <p>Regards,<br/>Vakeel Team</p>
    `
  );
}

  // =============================================
  // ✅ 2. REQUEST ACCEPTED
  // =============================================
  async sendRequestAccepted(email: string, name: string, professionalName: string) {
    return this.sendEmail(
      email,
      "✅ Your Request has been Accepted",
      `
      <h2>Hello ${name},</h2>
      <p>Your consultation request has been accepted.</p>
      <p><b>Professional:</b> ${professionalName}</p>
      <p>You can now start your conversation.</p>
      <br/>
      <p>Thanks,<br/>Vakeel Team</p>
      `
    );
  }

  // =============================================
  // ❌ 3. REQUEST REJECTED
  // =============================================
  async sendRequestRejected(email: string, name: string) {
    return this.sendEmail(
      email,
      "❌ Your Request was Rejected",
      `
      <h2>Hello ${name},</h2>
      <p>We’re sorry, your consultation request was not accepted.</p>
      <p>You can create a new request anytime.</p>
      <br/>
      <p>Thanks,<br/>Vakeel Team</p>
      `
    );
  }

  // =============================================
  // 👨‍⚖️ 4. REQUEST ASSIGNED TO PROFESSIONAL
  // =============================================
  async notifyProfessional(email: string, name: string, userName: string) {
    return this.sendEmail(
      email,
      "📢 New Consultation Assigned",
      `
      <h2>Hello ${name},</h2>
      <p>You have been assigned a new consultation request.</p>
      <p><b>User:</b> ${userName}</p>
      <p>Please check your dashboard.</p>
      <br/>
      <p>Thanks,<br/>Vakeel Team</p>
      `
    );
  }

  // =============================================
  // 💬 5. NEW MESSAGE NOTIFICATION
  // =============================================
  async sendNewMessage(email: string, name: string, senderName: string) {
    return this.sendEmail(
      email,
      "💬 New Message Received",
      `
      <h2>Hello ${name},</h2>
      <p>You received a new message from <b>${senderName}</b>.</p>
      <p>Login to your account to reply.</p>
      <br/>
      <p>Thanks,<br/>Vakeel Team</p>
      `
    );
  }
}

export const emailService = new EmailService();