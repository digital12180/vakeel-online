import mongoose from "mongoose";
import { Professional } from "../../models/professional.model.js";
import type { IProfessional } from "../../models/professional.model.js";
import { ApiError } from "../../utils/apiError.js";
import { User } from "../../models/user.model.js";
import bcrypt from "bcryptjs"
import type { ProRegisterDto } from "../auth/auth.dtos.js";

export class UserService {
    async TalkToPrefessional(userId: string, dto: ProRegisterDto) {
        const existing = await User.findOne({ email: dto.email });

        if (existing) {
            throw new ApiError(409, "Professional already exists");
        }

        const hashed = await bcrypt.hash(dto.password, 10);

        const professional = await Professional.create({
            fullname: dto.fullname,
            email: dto.email,
            password: hashed,
            phone: dto.phone,
            role: "professional",
            certificate: dto.certificate,
            professionType: dto.professionType,
            experience: dto.experience,
            city: dto.city,
            languages: dto.languages,
            services: dto.services,
            consultationFee: dto.consultationFee,
            practiceArea: dto.practiceArea,
            isActive: true // ✅ direct active
        });

        return { professional };
    }
}