import mongoose from "mongoose";
import { Service } from "../../models/service.model.js";
import type { IService } from "../../models/service.model.js";
import { ApiError } from "../../utils/apiError.js";

export class ServiceService {

    // ✅ CREATE- admin
    async createService(userId: string, data: Partial<IService>) {
        try {
            // 🔥 Validation
            if (!data.title || !data.description || !data.category) {
                throw new ApiError(400, "All fields are required");
            }

            const allowedCategories = ['legal', 'finance', 'corporate'];
            if (!allowedCategories.includes(data.category)) {
                throw new ApiError(400, "Invalid category");
            }

            // 🔥 Duplicate check
            const existing = await Service.findOne({ title: data.title });
            if (existing) {
                throw new ApiError(409, "Service already exists");
            }

            const service = await Service.create({
                title: data.title,
                description: data.description,
                category: data.category,
                createdBy: userId
            });

            return service;

        } catch (error: any) {
            console.error("❌ Create Service Error:", error.message);

            if (error instanceof ApiError) throw error;

            throw new ApiError(500, "Failed to create service");
        }
    }

    // ✅ GET ALL (with filter + pagination)
    async getAllServices(query: any) {
        try {
            const filter: any = {};

            // if (query.category) {
            //     filter.category = query.category;
            // }

            const page = Math.max(1, Number(query.page) || 1);
            const limit = Math.max(1, Number(query.limit) || 10);
            const skip = (page - 1) * limit;

            const services = await Service.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Service.countDocuments(filter);

            return {
                total,
                page,
                limit,
                services
            };

        } catch (error: any) {
            console.error("❌ Get All Services Error:", error.message);

            throw new ApiError(500, "Failed to fetch services");
        }
    }

    // ✅ GET BY ID
    async getServiceById(id: string) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid Service ID");
            }

            const service = await Service.findById(id);

            if (!service) {
                throw new ApiError(404, "Service not found");
            }

            return service;

        } catch (error: any) {
            console.error("❌ Get Service Error:", error.message);

            if (error instanceof ApiError) throw error;

            throw new ApiError(500, "Failed to fetch service");
        }
    }

    // ✅ UPDATE - admin
    async updateService(id: string, data: Partial<IService>) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid Service ID");
            }

            if (data.category) {
                const allowedCategories = ['legal', 'finance', 'corporate'];
                if (!allowedCategories.includes(data.category)) {
                    throw new ApiError(400, "Invalid category");
                }
            }

            const updated = await Service.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            );

            if (!updated) {
                throw new ApiError(404, "Service not found");
            }

            return updated;

        } catch (error: any) {
            console.error("❌ Update Service Error:", error.message);

            if (error instanceof ApiError) throw error;

            throw new ApiError(500, "Failed to update service");
        }
    }

    // ✅ DELETE - admin
    async deleteService(id: string) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid Service ID");
            }

            const deleted = await Service.findByIdAndDelete(id);

            if (!deleted) {
                throw new ApiError(404, "Service not found");
            }

            return deleted;

        } catch (error: any) {
            console.error("❌ Delete Service Error:", error.message);

            if (error instanceof ApiError) throw error;

            throw new ApiError(500, "Failed to delete service");
        }
    }
}