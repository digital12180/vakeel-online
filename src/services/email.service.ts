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

  async notifyUser(email: string, name: string, userName: string) {
    return this.sendEmail(
      email,
      "Professional Assigned to Your Request",
      `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      
      <h2 style="color: #2c3e50;">Hello ${name},</h2>
      
      <p>
        We’re happy to inform you that a professional has been successfully assigned to your request.
      </p>
      
      <div style="background: #f4f6f8; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <p style="margin: 0;"><strong>Assigned Professional:</strong> ${userName}</p>
      </div>
      
      <p>
        You can now connect with the professional and proceed further. 
        Please visit your dashboard for more details.
      </p>
      
      <div style="margin: 25px 0;">
        <a href="#" 
           style="background-color: #007bff; color: #fff; padding: 10px 18px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          Go to Dashboard
        </a>
      </div>
      
      <p>
        If you have any questions, feel free to reach out to our support team.
      </p>
      
      <br/>
      
      <p>
        Best regards,<br/>
        <strong>Vakeel Team</strong>
      </p>
    
    </div>
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
  // =============================================
  // 🔐 SEND OTP EMAIL
  // =============================================
  async sendOtpEmail(email: string, otp: string, name = "User") {
    try {
      console.log(`📧 Sending OTP to: ${email}`);

      const html = `
      <h2>Hello ${name},</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for 5 minutes.</p>
      <br/>
      <p>Thanks,<br/>Vakeel Team</p>
    `;

      await this.transporter.sendMail({
        from: `"Vakeel App" <${process.env.EMAIL}>`,
        to: email,
        subject: "🔐 OTP Verification",
        html,
      });

      console.log(`✅ OTP sent to ${email}`);

      return true;

    } catch (error: any) {
      console.error("❌ OTP email failed:", error.message);

      // fallback
      console.log(`🔐 OTP for ${email}: ${otp}`);

      return true;
    }
  }
  async sendPasswordResetEmail(email: string, name: string) {
    return this.sendEmail(
      email,
      "🔑 Password Reset Successful",
      `
      <h2>Hello ${name},</h2>
      <p>Your password has been successfully reset.</p>
      <p>If this wasn't you, contact support immediately.</p>
      <br/>
      <p>Thanks,<br/>Vakeel Team</p>
      `
    );
  }
}

export const emailService = new EmailService();