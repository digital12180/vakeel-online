import type { Request, Response } from "express";
import { ProfessionalService } from "./professional.service.js";
import { ApiError } from "../../utils/apiError.js";

export class ProfessionalController {
    private professionalService: ProfessionalService;
    constructor() {
        this.professionalService = new ProfessionalService();
    }
    // CREATE
    createProfessional = async (req: Request, res: Response) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            if (!userId) {
                return ApiError.unauthorized("Unauthorized user");
            }
            if (!req.body) {
                return res.status(400).json({
                    success: false,
                    message: "Data missing to create professional",
                });
            }
            const role = req.user.role;
            let data = req.body;

            // 🔥 If normal user → force own userId
            if (role === "professional") {
                data.userId = userId;
            }


            // 🔥 If admin → can pass any userId
            if (role === "admin" && !data.userId) {
                throw new ApiError(400, "userId is required for admin");
            }
            const professional = await this.professionalService.createProfessional(data);

            return res.status(201).json({
                success: true,
                message: "Professional created successfully",
                data: professional
            });

        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // GET ALL
    getAllProfessionals = async (req: Request, res: Response) => {
        try {

            const professionals = await this.professionalService.getAllProfessionals(req.query);

            res.status(200).json({
                success: true,
                data: professionals
            });

        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // GET BY ID
    getProfessionalById = async (req: Request, res: Response) => {
        try {

            if (!req.params.id) {
                return res.status(404).json({ message: "Professional id not provided" });
            }
            const professional = await this.professionalService.getProfessionalById(req.params.id);

            if (!professional) {
                return res.status(404).json({ message: "Not found" });
            }

            res.status(200).json({
                success: true,
                data: professional
            });

        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // UPDATE
    updateProfessional = async (req: Request, res: Response) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            if (!userId) {
                return ApiError.unauthorized("Unauthorized user");
            }
            if (!req.params.id) {
                return res.status(404).json({ message: "Professional id not provided" });
            }

            const updated = await this.professionalService.updateProfessional(
                req.params.id,
                req.body
            );

            res.status(200).json({
                success: true,
                message: "Updated successfully",
                data: updated
            });

        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // DELETE (Soft)
    deleteProfessional = async (req: Request, res: Response) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            if (!userId) {
                return ApiError.unauthorized("Unauthorized user");
            }
            if (!req.params.id) {
                return res.status(404).json({ message: "Professional id not provided" });
            }
            await this.professionalService.deleteProfessional(req.params.id);

            res.status(200).json({
                success: true,
                message: "Deleted successfully"
            });

        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // DELETE (Soft)
    softdeleteProfessional = async (req: Request, res: Response) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            if (!userId) {
                return ApiError.unauthorized("Unauthorized user");
            }
            if (!req.params.id) {
                return res.status(404).json({ message: "Professional id not provided" });
            }
            await this.professionalService.softdeleteProfessional(req.params.id);

            res.status(200).json({
                success: true,
                message: "Deleted successfully"
            });

        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    
}