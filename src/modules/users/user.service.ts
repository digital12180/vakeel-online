import mongoose from "mongoose";
import { ConsultationRequest } from "../../models/consultation-request.model.js";
import { ApiError } from "../../utils/apiError.js";
import { User } from "../../models/user.model.js";
import { Service } from "../../models/service.model.js";
import type { RequestDTO } from "../auth/auth.dtos.js";
import { emailService } from "../../services/email.service.js";
import { Notification } from "../../models/notification.model.js";
import { notificationService } from "../../services/notification.service.js";
export class UserService {
    async TalkToPrefessional(userId: string, data: RequestDTO) {
        try {
            console.log("👉 userId:", userId);
            console.log("👉 Incoming Data:", data);

            // ✅ Validate userId
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                throw new ApiError(401, "Invalid or unauthorized user");
            }

            // ✅ Fetch user
            const user = await User.findById(userId).select("fullname email phone");
            if (!user) {
                throw new ApiError(404, "User not found");
            }

            // ✅ Destructure
            const { category, city, language, issue, serviceId } = data;

            const fullname = data.fullname || user.fullname;
            const email = (data.email || user.email)?.toLowerCase().trim();
            const phone = data.phone || user.phone;

            // ✅ Validation
            if (!category || !city || !language || !issue) {
                throw new ApiError(400, "All required fields must be provided");
            }

            const allowedCategories = ["legal", "finance", "corporate"];
            if (!allowedCategories.includes(category)) {
                throw new ApiError(400, "Invalid category");
            }

            if (!city?.trim()) {
                throw new ApiError(400, "Invalid city");
            }

            if (!language?.trim()) {
                throw new ApiError(400, "Invalid language");
            }

            if (!issue || issue.trim().length < 10) {
                throw new ApiError(400, "Issue must be at least 10 characters");
            }

            // ✅ Service validation
            let validServiceId;

            if (serviceId && typeof serviceId === "string") {

                console.log("👉 serviceId:", serviceId);

                const cleanId = serviceId;

                // 🚨 block fake values
                if (
                    cleanId === "" ||
                    cleanId === "undefined" ||
                    cleanId === "null"
                ) {
                    throw new ApiError(400, "Invalid service ID value");
                }

                // ✅ strict ObjectId check
                if (!mongoose.Types.ObjectId.isValid(cleanId)) {
                    throw new ApiError(400, "Invalid service ID format");
                }

                const service = await Service.findById(cleanId);
                if (!service) {
                    throw new ApiError(404, "Service not found");
                }

                validServiceId = service._id;
            }

            // ✅ Create consultation
            const consultation = await ConsultationRequest.create({
                userId,
                fullname,
                email,
                phone,
                category,
                city: city.trim(),
                language: language.trim(),
                issue: issue.trim(),
                serviceId: validServiceId,
                consultationFee: 499,
                status: "pending",
                paymentStatus: "paid"
            });
            await Notification.create({
                userId: userId,
                title: "📩 Consultation Request Submitted",
                message:
                    "Your consultation request has been submitted successfully. Our team will review and assign a professional shortly.",
                type: "consultation",
                isRead: false,
            });

            try {
                await notificationService.sendRequestCreated(
                    userId,
                    user.fullname
                );
            } catch (error: any) {
                console.error("⚠️ Notification failed:", error.message);
            }
            // ✅ Email safe
            try {
                await emailService.sendRequestCreated(user.email, user.fullname);
            } catch (err: any) {
                console.error("⚠️ Email failed:", err.message);
            }

            return consultation;

        } catch (error: any) {
            console.error("❌ FULL ERROR:", error);

            throw error instanceof ApiError
                ? error
                : new ApiError(500, error.message || "Internal Server Error");
        }
    }
}