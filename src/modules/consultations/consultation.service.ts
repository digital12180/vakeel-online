import mongoose from "mongoose";
import { ConsultationRequest } from "../../models/consultation-request.model.js";
import { Professional } from "../../models/professional.model.js";
import { Service } from "../../models/service.model.js";
import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/apiError.js";
import { emailService } from "../../services/email.service.js";
import { notificationService } from "../../services/notification.service.js";
import { Notification } from "../../models/notification.model.js";

export class ConsultationService {

    async createRequest(userId: string, professionalId: string) {
        try {
            // 🔍 DEBUG LOGS (remove in production)
            console.log("👉 userId:", userId);
            console.log("👉 professionalId:", professionalId);

            // ✅ Validate IDs
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                throw new ApiError(401, "Invalid or unauthorized user");
            }

            if (!professionalId || !mongoose.Types.ObjectId.isValid(professionalId)) {
                throw new ApiError(400, "Invalid professional id");
            }

            // ✅ Fetch user
            const user = await User.findById(userId);
            if (!user) {
                throw new ApiError(404, "User not found");
            }

            // ✅ Fetch professional
            const professional = await Professional.findById(professionalId);
            if (!professional) {
                throw new ApiError(404, "Professional not found");
            }

            // ✅ Fetch service
            const service = await Service.findById(professional.serviceId);
            if (!service) {
                throw new ApiError(404, "Service not found");
            }

            // ✅ Create consultation request
            const consultation = await ConsultationRequest.create({
                userId,
                fullname: user.fullname || "",
                email: user.email || "",
                phone: user.phone || "",
                category: service.category || "",
                city: professional.city?.trim() || "",
                languages: professional.languages || [],
                issue: service.description?.trim() || "",
                serviceId: service._id,
                consultationFee: professional.consultationFee || 0,
                professionalId: professional._id,
                status: "assigned",
                paymentStatus: "pending"
            });
            await Notification.create({
                userId: userId,
                title: "Consultation Request",
                message: "Request submitted to the professional successfully!",
                type: "consultation",
                isRead: false
            })
            try {
                await notificationService.sendRequestCreated(
                    userId,
                    user.fullname
                );
            } catch (error: any) {
                console.error("⚠️ Notification failed:", error.message);
            }

            // ✅ Send email (NON-BLOCKING)
            try {
                await emailService.sendRequestToProfessional(
                    user.email,
                    user.fullname
                );
            } catch (emailError: any) {
                console.error("⚠️ Email failed:", emailError.message);
            }

            return consultation;

        } catch (error: any) {
            console.error("❌ Create Consultation Error FULL:", error);

            // ✅ Return original error (DO NOT HIDE)
            throw error instanceof ApiError
                ? error
                : new ApiError(500, error.message || "Internal Server Error");
        }
    }

    //   async createRequest(userId: string, id: string) {
    //     try {
    //         if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    //             throw new ApiError(401, "Invalid or unauthorized user");
    //         }

    //         const user = await User.findById(userId);
    //         if (!user) {
    //             throw new ApiError(404, "User not found");
    //         }

    //         const professional = await Professional.findById(id);
    //         if (!professional) {
    //             throw new ApiError(404, "Professional not found");
    //         }
    //         // const { category, city, language, issue, serviceId } = data;

    //         // if (!category || !city || !language || !issue) {
    //         //     throw new ApiError(400, "All required fields must be provided");
    //         // }

    //         // const allowedCategories = ["legal", "finance", "corporate"];
    //         // if (!allowedCategories.includes(category)) {
    //         //     throw new ApiError(400, "Invalid category");
    //         // }

    //         // if (typeof city !== "string" || city.trim() === "") {
    //         //     throw new ApiError(400, "Invalid city");
    //         // }

    //         // if (typeof language !== "string" || language.trim() === "") {
    //         //     throw new ApiError(400, "Invalid language");
    //         // }

    //         // if (typeof issue !== "string" || issue.trim().length < 10) {
    //         //     throw new ApiError(400, "Issue must be at least 10 characters");
    //         // }

    //         let validServiceId = undefined;
    //         // if (serviceId) {
    //         //     if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    //         //         throw new ApiError(400, "Invalid service ID");
    //         //     }

    //         const service = await Service.findById(serviceId);
    //         if (!service) {
    //             throw new ApiError(404, "Service not found");
    //         }

    //         //     validServiceId = service._id;
    //         // }

    //         const consultation = await ConsultationRequest.create({
    //             userId,
    //             fullname: user.fullname,
    //             email: user.email,
    //             phone: user.phone,
    //             // category: service.category,
    //             city: professional.city.trim(),
    //             language: professional.languages,
    //             // issue: service.description.trim(),
    //             serviceId: service._id,
    //             consultationFee: professional.consultationFee,
    //             status: "pending",
    //             paymentStatus: "pending"
    //         });

    //         return consultation;

    //     } catch (error: any) {
    //         console.error("❌ Create Consultation Error:", error.message);
    //         throw error instanceof ApiError
    //             ? error
    //             : new ApiError(500, "Failed to create consultation request");
    //     }
    // }

    // ✅ GET ALL (STRICT FILTERS)
    async getAllRequests(query: any, extraFilter: any = {}) {
        try {
            const filter: any = {
                isActive: true,
                ...extraFilter // ✅ merge role filter here
            };

            if (query.status) {
                const allowedStatus = ["pending", "assigned", "accepted", "rejected", "completed", "cancelled"];
                if (!allowedStatus.includes(query.status)) {
                    throw new ApiError(400, "Invalid status filter");
                }
                filter.status = query.status;
            }

            if (query.paymentStatus) {
                const allowedPayment = ["pending", "paid", "failed"];
                if (!allowedPayment.includes(query.paymentStatus)) {
                    throw new ApiError(400, "Invalid payment status");
                }
                filter.paymentStatus = query.paymentStatus;
            }

            if (query.category) {
                filter.category = query.category;
            }

            const page = Math.max(1, Number(query.page) || 1);
            const limit = Math.max(1, Number(query.limit) || 10);
            const skip = (page - 1) * limit;

            const requests = await ConsultationRequest.find(filter)
                .populate("userId", "fullname email")
                .populate("professionalId", "_id fullname email")
                .populate("serviceId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await ConsultationRequest.countDocuments(filter);

            return { total, page, limit, requests };

        } catch (error: any) {
            console.error("Fetch Consultation Error:", error.message);
            throw error instanceof ApiError
                ? error
                : new ApiError(500, "Failed to fetch consultation requests");
        }
    }

    // ✅ GET BY ID (STRICT)
    async getRequestById(id: string) {
        try {
            if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid consultation ID");
            }

            const request = await ConsultationRequest.findOne({
                _id: id,
                isActive: true
            })
                .populate("userId", "fullname email")
                .populate("professionalId", "_id fullname email")
                .populate("serviceId");

            if (!request) {
                throw new ApiError(404, "Consultation request not found");
            }

            return request;

        } catch (error: any) {
            console.error("❌ Get Consultation Error:", error.message);
            throw error instanceof ApiError
                ? error
                : new ApiError(500, "Failed to fetch consultation");
        }
    }

    // ✅ UPDATE STATUS (STRICT FLOW)
    async updateStatus(
        id: string,
        data: any,
        userId: string,
        role: string
    ) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid consultation ID");
            }

            const request = await ConsultationRequest.findById(id);
            if (!request) {
                throw new ApiError(404, "Consultation not found");
            }
            const user = await User.findById(request.userId);
            let professional;
            // 🔥 PROFESSIONAL ACCESS CHECK
            if (role === "professional") {
                professional = await Professional.findOne({ _id: userId });

                if (!professional) {
                    throw new ApiError(403, "Professional profile not found");
                }

                // 🔥 ONLY ASSIGNED PROFESSIONAL CAN UPDATE
                if (
                    !request.professionalId ||
                    request.professionalId.toString() !== professional._id.toString()
                ) {
                    throw new ApiError(403, "You can only update your assigned consultations");
                }
            }

            // 🔥 ADMIN → no restriction

            const { status, meetingLink, contactNumber } = data;

            const allowedStatus = [
                "assigned",
                "accepted",
                "rejected",
                "completed",
                "cancelled"
            ];

            if (!allowedStatus.includes(status)) {
                throw new ApiError(400, "Invalid status");
            }

            if (request.status === "completed") {
                throw new ApiError(400, "Cannot update completed consultation");
            }

            // 🔥 ACCEPT VALIDATION
            if (status === "accepted") {
                throw new ApiError(
                    400,
                    "Meeting link or contact number required when accepting"
                );
            }

            request.status = status;
            if (status === "accepted") {
                await Notification.create({
                    userId: userId,
                    title: "Request Accepted",
                    message: "Your consultation request has been accepted",
                    type: "consultation",
                    isRead: false,
                })
                try {
                    await notificationService.sendRequestAccepted(
                        userId,
                        user.fullname,
                        professional.fullname
                    );
                } catch (error: any) {
                    console.error("⚠️ Notification failed:", error.message);
                }
                await emailService.sendRequestAccepted(user.email, user.fullname, professional.fullname);
            } else if (status === "rejected") {
                await Notification.create({
                    userId: userId,
                    title: "Request Rejected",
                    message: "Your consultation request has been rejected",
                    type: "consultation",
                    isRead: false,
                })
                try {
                    await notificationService.sendRequestRejected(
                        userId,
                        user.fullname
                    );
                } catch (error: any) {
                    console.error("⚠️ Notification failed:", error.message);
                }
                await emailService.sendRequestRejected(user.email, user.fullname);
            }
            if (meetingLink) request.meetingLink = meetingLink.trim() ?? "";
            if (contactNumber) request.contactNumber = contactNumber.trim() ?? "";

            await request.save();

            return request;

        } catch (error: any) {
            console.error("❌ Update Status Error:", error.message);
            throw error instanceof ApiError
                ? error
                : new ApiError(500, "Failed to update consultation status");
        }
    }

    // ✅ DELETE (STRICT SOFT DELETE)
    async deleteRequest(id: string) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid consultation ID");
            }

            const request = await ConsultationRequest.findById(id);
            if (!request) {
                throw new ApiError(404, "Consultation not found");
            }

            if (!request.isActive) {
                throw new ApiError(400, "Already deleted");
            }

            request.isActive = false;
            await request.save();

            return { message: "Consultation request deleted successfully" };

        } catch (error: any) {
            console.error("❌ Delete Error:", error.message);
            throw error instanceof ApiError
                ? error
                : new ApiError(500, "Failed to delete consultation");
        }
    }

    // 🔥 AUTO ASSIGN PROFESSIONAL (STRICT MATCHING)
    async assignProfessional(consultation: any) {
        try {
            if (!consultation || !consultation._id) {
                throw new ApiError(400, "Invalid consultation object");
            }

            const map: any = {
                legal: "Lawyer / Advocate",
                finance: "Chartered Accountant",
                corporate: "Company Secretary"
            };

            const professionType = map[consultation.category];
            if (!professionType) {
                throw new ApiError(400, "Invalid consultation category");
            }

            const professional = await Professional.findOne({
                professionType: { $in: [professionType, "All"] },
                city: consultation.city,
                languages: { $in: [consultation.language] },
                isActive: true
            }).sort({ experience: -1 });

            if (!professional) {
                console.warn("⚠ No professional found");
                return null;
            }

            consultation.professionalId = professional._id;
            consultation.status = "assigned";
            await consultation.save();

            return consultation;

        } catch (error: any) {
            console.error("❌ Assign Professional Error:", error.message);
            throw error instanceof ApiError
                ? error
                : new ApiError(500, "Failed to assign professional");
        }
    }


    //MANUAL ASSIGN BY ADMIN 
    async assignProfessionalByAdmin(
        consultationId: string,
        professionalId: string
    ) {
        try {
            // 🔥 VALIDATION
            if (!mongoose.Types.ObjectId.isValid(consultationId)) {
                throw new ApiError(400, "Invalid consultation ID");
            }

            if (!mongoose.Types.ObjectId.isValid(professionalId)) {
                throw new ApiError(400, "Invalid professional ID");
            }

            // 🔥 FETCH CONSULTATION
            const consultation = await ConsultationRequest.findById(consultationId);

            if (!consultation) {
                throw new ApiError(404, "Consultation not found");
            }

            // ❌ Already assigned check
            if (consultation.professionalId) {
                throw new ApiError(400, "Professional already assigned");
            }
            const user = await User.findById(consultation.userId);
            if (!user) {
                throw new ApiError(404, "User not found");
            }
            // 🔥 FETCH PROFESSIONAL
            const professional = await Professional.findById(professionalId);

            if (!professional || !professional.isActive) {
                throw new ApiError(404, "Professional not found or inactive");
            }

            // 🔥 OPTIONAL: MATCH VALIDATION (VERY IMPORTANT)
            const map: any = {
                legal: "Lawyer / Advocate",
                finance: "Chartered Accountant",
                corporate: "Company Secretary"
            };

            const expectedType = map[consultation.category];
            if (
                ![expectedType, "All"].includes(professional.professionType)
            ) {
                throw new ApiError(
                    400,
                    "Selected professional does not match consultation category"
                );
            }

            // 🔥 ASSIGN
            consultation.professionalId = professional._id;
            consultation.status = "assigned";

            try {
                await emailService.notifyProfessional(professional.email, professional.fullname, user.fullname)

            } catch (error: any) {
                console.error("⚠️ Email failed:", error.message);
            }
            await Notification.create({
                userId: user._id,
                title: "👨‍⚖️ Professional Assigned",
                message: `Your consultation request has been assigned to ${professional.fullname}.`,
                type: "consultation",
                isRead: false,
            });

            try {
                await notificationService.sendRequestAssigned(
                    user._id,
                    user.fullname,
                    professional.fullname
                );
            } catch (error: any) {
                console.error("⚠️ Notification failed:", error.message);
            }
            try {
                await notificationService.notifyProfessional(
                    professional._id,
                    professional.fullname,
                    user.fullname,
                );
            } catch (error: any) {
                console.error("⚠️ Notification failed:", error.message);
            }

            return consultation;

        } catch (error: any) {
            console.error("❌ Manual Assign Error:", error.message);
            throw error instanceof ApiError
                ? error
                : new ApiError(500, "Failed to assign professional");
        }
    }

    async getAllRequestsByUser(query: any, userId: string) {
        try {
            const filter: any = { isActive: true, userId: userId };

            if (query.status) {
                const allowedStatus = ["pending", "assigned", "accepted", "rejected", "completed", "cancelled"];
                if (!allowedStatus.includes(query.status)) {
                    throw new ApiError(400, "Invalid status filter");
                }
                filter.status = query.status;
            }

            if (query.paymentStatus) {
                const allowedPayment = ["pending", "paid", "failed"];
                if (!allowedPayment.includes(query.paymentStatus)) {
                    throw new ApiError(400, "Invalid payment status");
                }
                filter.paymentStatus = query.paymentStatus;
            }

            if (query.category) {
                filter.category = query.category;
            }

            const page = Math.max(1, Number(query.page) || 1);
            const limit = Math.max(1, Number(query.limit) || 10);
            const skip = (page - 1) * limit;

            const requests = await ConsultationRequest.find(filter)
                .populate("userId", "fullname email")
                .populate("professionalId", "_id fullname email")
                .populate("serviceId")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await ConsultationRequest.countDocuments(filter);

            return { total, page, limit, requests };

        } catch (error: any) {
            console.error("Fetch Consultation Error:", error.message);
            throw error instanceof ApiError
                ? error
                : new ApiError(500, "Failed to fetch consultation requests");
        }
    }
}