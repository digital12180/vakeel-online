import mongoose from "mongoose";
import { ConsultationRequest } from "../../models/consultation-request.model.js";
import { ApiError } from "../../utils/apiError.js";
import { User } from "../../models/user.model.js";
import bcrypt from "bcryptjs"
import type { RequestDTO } from "../auth/auth.dtos.js";

export class UserService {
    async TalkToPrefessional(userId: string, dto: RequestDTO) {
        const user = await User.findOne({ _id: userId });
        if (!user) {
            throw new ApiError(400, "User not found");
        }
        const existing = await ConsultationRequest.findOne({ serviceId: dto.serviceId });

        if (existing) {
            throw new ApiError(409, "This Request already exists");
        }

        const request = await ConsultationRequest.create({
            fullname: dto.fullname,
            email: dto.email,
            phone: dto.phone,
            category: dto.category,
            city: dto.city,
            language: dto.language,
            issue: dto.issue,
            serviceId:dto.serviceId
        });

        return { request };
    }
}