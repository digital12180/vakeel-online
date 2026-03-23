import type { Request, Response } from "express";
import { ProfessionalService } from "./professional.service.js";
import { ApiError } from "../../utils/apiError.js";

export class ProfessionalController {
    private professionalService: ProfessionalService;
    constructor() {
        this.professionalService = new ProfessionalService();
    }
    // CREATE BY Admin
    createProfessional = async (req: Request, res: Response) => {
        try {
            const adminId = req.user?._id || req.tokenData?.userId;

            if (!adminId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized user",
                });
            }

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Certificate required",
                });
            }

            const data = req.body;

            const professional =
                await this.professionalService.adminCreateProfessional(
                    adminId,
                    data,
                    req.file
                );

            return res.status(201).json({
                success: true,
                message: "Professional created successfully",
                data: professional,
            });

        } catch (error: any) {
            console.error("❌ Create Professional Error:", error);

            return res.status(500).json({
                success: false,
                message: error.message,
            });
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

    updateCertificateByAdmin = async (req: Request, res: Response) => {
        try {
            const professionalId = req.params.id;

            if (!professionalId) {
                return res.status(400).json({
                    success: false,
                    message: "Professional ID required",
                });
            }

            const updatedProfessional =
                await this.professionalService.updateCertificateByAdmin(
                    professionalId,
                    req.file
                );

            return res.status(200).json({
                success: true,
                message: "Professional updated successfully",
                data: updatedProfessional,
            });

        } catch (error: any) {
            console.error("❌ Update Error:", error);

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };

    updateCertificate = async (req: Request, res: Response) => {
        try {
            const professionalId = req.user._id || req.user.userId;

            if (!professionalId) {
                return res.status(400).json({
                    success: false,
                    message: "Unauthorized Professional",
                });
            }

            const updatedProfessional =
                await this.professionalService.updateCertificate(
                    professionalId,
                    req.file
                );

            return res.status(200).json({
                success: true,
                message: "Professional updated successfully",
                data: updatedProfessional,
            });

        } catch (error: any) {
            console.error("❌ Update Error:", error);

            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };
}