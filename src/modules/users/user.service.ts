import mongoose from "mongoose";
import { ConsultationRequest } from "../../models/consultation-request.model.js";
import { ApiError } from "../../utils/apiError.js";
import { User } from "../../models/user.model.js";
import { Service } from "../../models/service.model.js";
import type { RequestDTO } from "../auth/auth.dtos.js";

export class UserService {

    async TalkToPrefessional(userId: string, data: RequestDTO) {
        try {
            // ✅ 1. Validate userId
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                throw new ApiError(401, "Invalid or unauthorized user");
            }

            // ✅ 2. Fetch user (only required fields)
            const user = await User.findById(userId).select("fullname email phone");
            if (!user) {
                throw new ApiError(404, "User not found");
            }

            // ✅ 3. Destructure + sanitize
            const {
                category,
                city,
                language,
                issue,
                serviceId
            } = data;

            const fullname = data.fullname || user.fullname;
            const email = (data.email || user.email)?.toLowerCase().trim();
            const phone = data.phone || user.phone;

            // ✅ 4. Required fields validation
            if (!category || !city || !language || !issue) {
                throw new ApiError(400, "All required fields must be provided");
            }

            // ✅ 5. Enum validation (strong)
            const allowedCategories = ["legal", "finance", "corporate"];
            if (!allowedCategories.includes(category)) {
                throw new ApiError(400, "Invalid category");
            }

            // ✅ 6. Input validation
            if (typeof city !== "string" || !city.trim()) {
                throw new ApiError(400, "Invalid city");
            }

            if (typeof language !== "string" || !language.trim()) {
                throw new ApiError(400, "Invalid language");
            }

            if (typeof issue !== "string" || issue.trim().length < 10) {
                throw new ApiError(400, "Issue must be at least 10 characters");
            }

            // ✅ 7. Service validation
            let validServiceId: mongoose.Types.ObjectId | undefined;

            if (serviceId) {
                if (
                    typeof serviceId !== "string" ||
                    !mongoose.Types.ObjectId.isValid(serviceId)
                ) {
                    throw new ApiError(400, "Invalid service ID");
                }
                const service = await Service.findById(serviceId).select("_id");
                if (!service) {
                    throw new ApiError(404, "Service not found");
                }

                validServiceId = service._id;
            }

            // ✅ 8. Create consultation
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
                consultationFee: 499, // 🔥 move to config later
                status: "pending",
                paymentStatus: "pending"
            });

            return consultation;

        } catch (error: any) {
            console.error("❌ Create Consultation Error:", {
                message: error.message,
                stack: error.stack
            });

            throw error instanceof ApiError
                ? error
                : new ApiError(500, "Failed to create consultation request");
        }
    }
}