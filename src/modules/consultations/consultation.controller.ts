import type { Request, Response, NextFunction } from "express";
import { ConsultationService } from "./consultation.service.js";
import { ApiError } from "../../utils/apiError.js";
import { Professional } from "../../models/professional.model.js";
const consultationService = new ConsultationService();

export class ConsultationController {

    // ✅ CREATE CONSULTATION (USER)
   createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?._id || req.tokenData?.userId;
        const professionalId = req.params.id;

        if (!userId) {
            return next(new ApiError(401, "Unauthorized user"));
        }

        if (!professionalId) {
            return next(new ApiError(400, "Professional id required"));
        }

        const consultation = await consultationService.createRequest(
            userId,
            professionalId
        );

        return res.status(201).json({
            success: true,
            message: "Consultation request created successfully",
            data: consultation
        });

    } catch (error) {
        next(error);
    }
};

    // ✅ GET ALL (ADMIN / USER)
    getAllRequests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            const role = req.user?.role || req.tokenData?.role;

            if (!userId) {
                return next(new ApiError(401, "Unauthorized"));
            }

            let extraFilter: any = {};

            if (role === "user") {
                extraFilter.userId = userId;
            }

            else if (role === "professional") {
                // 🔥 get professionalId from userId
                const professional = await Professional.findOne({
                    _id: userId
                });

                if (!professional) {
                    return res.status(200).json({
                        success: true,
                        message: "No consultations assigned",
                        total: 0,
                        page: 1,
                        limit: 10,
                        requests: []
                    });
                }

                extraFilter.professionalId = professional._id;
            }


            const result = await consultationService.getAllRequests(
                req.query,
                extraFilter // ✅ pass separately
            );

            return res.status(200).json({
                success: true,
                message: "Consultation requests fetched",
                ...result
            });

        } catch (error) {
            next(error);
        }
    };

    // ✅ GET SINGLE
    getRequestById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            const role = req.user?.role || req.tokenData?.role;

            if (!userId) {
                return next(new ApiError(401, "Unauthorized"));
            }

            const { id } = req.params;

            const request = await consultationService.getRequestById(id);

            // 🔥 USER → only own request
            if (
                role === "user" &&
                request.userId._id.toString() !== userId.toString()
            ) {
                return next(new ApiError(403, "Access denied"));
            }

            // 🔥 PROFESSIONAL → only assigned request
            if (role === "professional") {
                const professional = await Professional.findOne({ userId });

                if (
                    !professional ||
                    request.professionalId?.toString() !== professional._id.toString()
                ) {
                    return next(new ApiError(403, "Access denied"));
                }
            }

            // 🔥 ADMIN → full access (no check needed)

            return res.status(200).json({
                success: true,
                message: "Consultation fetched",
                data: request
            });

        } catch (error) {
            next(error);
        }
    };

    // ✅ UPDATE STATUS (PROFESSIONAL / ADMIN)
    updateStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            const role = req.user?.role || req.tokenData?.role;

            if (!userId) {
                return next(new ApiError(401, "Unauthorized"));
            }

            if (!["professional", "admin"].includes(role)) {
                return next(new ApiError(403, "Access denied"));
            }

            const { id } = req.params;
            console.log({
                id,
                body: req.body,
                userId,
                role
            });

            const updated = await consultationService.updateStatus(
                id,
                req.body,
                userId,
                role
            );

            return res.status(200).json({
                success: true,
                message: "Consultation status updated",
                data: updated
            });

        } catch (error) {
            next(error);
        }
    };

    // ✅ DELETE (USER / ADMIN)
    deleteRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            const role = req.user?.role || req.tokenData?.role;

            const { id } = req.params;

            const request = await consultationService.getRequestById(id);

            // 🔥 ONLY OWNER OR ADMIN
            if (role === "user" && request.userId._id.toString() !== userId.toString()) {
                return next(new ApiError(403, "You can delete only your own request"));
            }

            const result = await consultationService.deleteRequest(id);

            return res.status(200).json({
                success: true,
                message: result.message
            });

        } catch (error) {
            next(error);
        }
    };

    //MANUAL ASSIGNED BY ADMIN
    assignProfessionalByAdmin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params; // consultationId
            const { professionalId } = req.body;

            const result = await consultationService.assignProfessionalByAdmin(
                id,
                professionalId
            );

            return res.status(200).json({
                success: true,
                message: "Professional assigned successfully",
                data: result
            });

        } catch (error) {
            next(error);
        }
    };
}