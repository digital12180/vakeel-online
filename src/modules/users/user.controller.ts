import { UserService } from "./user.service.js"
import type { Request, Response } from "express";
import { ApiError } from "../../utils/apiError.js";
import { PaymentService } from "../payments/payment.service.js";

export class UserController {
    private paymentService: PaymentService;
    private userService: UserService;
    constructor() {
        this.userService = new UserService();
        this.paymentService = new PaymentService();
    }

    talkToProfessional = async (req: Request, res: Response) => {
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
            const hasAccess = await this.paymentService.hasGlobalAccess(userId);

            if (!hasAccess) {
                throw new ApiError(402, "Please pay ₹499 to talk with professionals");
            }
            const role = req.user.role;
            let data = req.body;

            const request = await this.userService.TalkToPrefessional(userId, data);

            return res.status(201).json({
                success: true,
                message: "Rquest created to professional successfully",
                data: request
            });

        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    };


}