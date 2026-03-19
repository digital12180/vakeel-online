import type { NextFunction, Request, Response } from "express";
import { ServiceService } from "./service.service.js";
import message, { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../responses/message.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { ApiError } from "../../utils/apiError.js";

export class ServiceController {
    private serviceServices: ServiceService;

    constructor() {
        this.serviceServices = new ServiceService();
        this.createService = this.createService.bind(this);
        this.getAllServices = this.getAllServices.bind(this);
        this.getServiceById = this.getServiceById.bind(this);
        this.updateService = this.updateService.bind(this);
        this.deleteService = this.deleteService.bind(this);
    }
    // CREATE
    createService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            if (!userId) {
                return ApiError.unauthorized("Unauthorized user");
            }
            const { title,
                description,
                category, } = req.body;
            if (!title || !description || !category) {
                return ApiError.requiredfield(ERROR_MESSAGES.REQUIRED_PARAM_MISSING);
            }
            const service = await this.serviceServices.createService(userId, req.body);

            return ApiResponse.success(res, service, SUCCESS_MESSAGES.SERVICE_ADDED, 200)
        } catch (error: any) {
            next(error);
            return ApiError.serverError(ERROR_MESSAGES.SERVER_ERROR)
        }
    };

    // GET ALL
    getAllServices = async (req: Request, res: Response, next: NextFunction) => {
        try {

            const result = await this.serviceServices.getAllServices(req.query);
            // ApiResponse.success(res, ...result , SUCCESS_MESSAGES.SERVICE_FETCHED);
            return res.status(200).json({ message: SUCCESS_MESSAGES.SERVICE_FETCHED, ...result })
        } catch (error: any) {
            next(error);
            return ApiError.serverError(ERROR_MESSAGES.SERVER_ERROR)
        }
    };

    // GET BY ID
    getServiceById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            
            if (!req.params.id) {
                return res.status(404).json({ message: "Service id not provided" });
            }
            const service = await this.serviceServices.getServiceById(req.params.id);

            if (!service) {
                return res.status(404).json({ message: "Service not found" });
            }

            ApiResponse.success(res, service, SUCCESS_MESSAGES.SERVICE_FETCHED);

        } catch (error: any) {
            next(error);
            return ApiError.serverError(ERROR_MESSAGES.SERVER_ERROR)
        }
    };

    // UPDATE
    updateService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            if (!userId) {
                return ApiError.unauthorized("Unauthorized user");
            }
            if (!req.params.id) {
                return res.status(404).json({ message: "Service id not provided" });
            }
            if (!req.body) {
                return res.status(404).json({ message: "No data to update" });
            }
            const updated = await this.serviceServices.updateService(
                req.params.id,
                req.body
            );


            ApiResponse.success(res, updated, SUCCESS_MESSAGES.SERVICE_UPDATED);

        } catch (error: any) {
            next(error);
            return ApiError.serverError(ERROR_MESSAGES.SERVER_ERROR)
        }
    };

    // DELETE
    deleteService = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id || req.tokenData?.userId;
            if (!userId) {
                return ApiError.unauthorized("Unauthorized user");
            }
            if (!req.params.id) {
                return res.status(404).json({ message: "Service id not provided" });
            }
            await this.serviceServices.deleteService(req.params.id);

            ApiResponse.success(res, null, SUCCESS_MESSAGES.SERVICE_DELETED);

        } catch (error: any) {
            next(error);
            return ApiError.serverError(ERROR_MESSAGES.SERVER_ERROR)
        }
    };
}