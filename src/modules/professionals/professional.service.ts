import mongoose from "mongoose";
import { Professional } from "../../models/professional.model.js";
import type { IProfessional } from "../../models/professional.model.js";
import { ApiError } from "../../utils/apiError.js";
import { User } from "../../models/user.model.js";
import type { ProRegisterDto } from "../auth/auth.dtos.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import { deleteFromCloudinary } from "../../utils/deleteImage.js";
import bcrypt from "bcryptjs";


export class ProfessionalService {

    // ✅ CREATE
    // async createProfessional(data: Partial<IProfessional>) {
    //     try {
    //         // 🔥 Required fields check
    //         const requiredFields = [
    //             "userId",
    //             "professionType",
    //             "experience",
    //             "city",
    //             "consultationFee",
    //             "practiceArea"
    //         ];

    //         for (const field of requiredFields) {
    //             if (!data[field as keyof IProfessional]) {
    //                 throw new ApiError(400, `${field} is required`);
    //             }
    //         }

    //         if (!mongoose.Types.ObjectId.isValid(String(data.userId))) {
    //             throw new ApiError(400, "Invalid userId");
    //         }
    //         const allowedTypes = ['All', 'Lawyer / Advocate', 'Chartered Accountant', 'Company Secretary'];
    //         if (!allowedTypes.includes(String(data.professionType))) {
    //             throw new ApiError(400, "Invalid professionType");
    //         }

    //         if (data.experience! < 0 || data.experience! > 60) {
    //             throw new ApiError(400, "Invalid experience value");
    //         }

    //         if (data.consultationFee! < 0) {
    //             throw new ApiError(400, "Invalid consultation fee");
    //         }

    //         // normalize languages
    //         if (data.languages !== undefined && data.languages !== null) {
    //             let langInput = data.languages;

    //             // 🔥 FORCE STRING BEFORE SPLIT
    //             if (typeof langInput === "string" || langInput instanceof String) {
    //                 data.languages = String(langInput)
    //                     .split(",")
    //                     .map((l) => l.trim());
    //             }
    //             else if (Array.isArray(langInput)) {
    //                 data.languages = langInput
    //                     .map((l) => String(l).trim())
    //                     .flatMap((l) => l.includes(",") ? l.split(",") : l); // 🔥 handle ["English, Hindi"]
    //             }
    //             else {
    //                 throw new ApiError(400, "Languages must be string or array");
    //             }

    //             data.languages = data.languages
    //                 .map((l: string) => l.trim())
    //                 .filter((l: string) => l)
    //                 .filter((v: string, i: number, arr: string[]) => arr.indexOf(v) === i);
    //         }

    //         if (data.services !== undefined && data.services !== null) {
    //             let normalizedServices: string[] = [];

    //             // ✅ string case
    //             if (typeof data.services === "string" || normalizedServices instanceof String) {
    //                 normalizedServices = String(data.services).split(",");
    //             }

    //             // ✅ array case
    //             else if (Array.isArray(data.services)) {
    //                 normalizedServices = data.services.flatMap((s) =>
    //                     String(s).includes(",")
    //                         ? String(s).split(",")
    //                         : String(s)
    //                 );
    //             }

    //             // ❌ invalid
    //             else {
    //                 throw new ApiError(400, "Services must be string or array");
    //             }

    //             // ✅ clean + convert to ObjectId
    //             const objectIds = normalizedServices
    //                 .map((s) => s.trim())
    //                 .filter((s) => mongoose.Types.ObjectId.isValid(s))
    //                 .map((s) => new mongoose.Types.ObjectId(s));

    //             if (objectIds.length === 0) {
    //                 throw new ApiError(400, "Invalid service IDs");
    //             }

    //             data.services = objectIds;
    //         }

    //         const existing = await Professional.findOne({ userId: data.userId });
    //         if (existing) {
    //             throw new ApiError(409, "Professional profile already exists");
    //         }
    //         data.createdBy = data.userId;
    //         const professional = await Professional.create(data);

    //         return professional;

    //     } catch (error: any) {
    //         console.error("❌ Create Professional Error:", error.message);

    //         if (error instanceof ApiError) throw error;

    //         throw new ApiError(500, "Failed to create professional");
    //     }
    // }

    async adminCreateProfessional(
        adminId: string,
        dto: ProRegisterDto,
        file: Express.Multer.File
    ) {
        // ✅ Check in BOTH collections (important)
        const existingUser = await User.findOne({ email: dto.email });
        const existingProfessional = await Professional.findOne({ email: dto.email });

        if (existingUser || existingProfessional) {
            throw new ApiError(409, "Professional already exists");
        }

        // ✅ Upload certificate to Cloudinary
        const uploadResult: any = await uploadToCloudinary(file.buffer);

        // ✅ Hash password
        const hashed = await bcrypt.hash(dto.password, 10);

        // ✅ Create professional
        const professional = await Professional.create({
            fullname: dto.fullname,
            email: dto.email.toLowerCase().trim(),
            password: hashed,
            phone: dto.phone,
            role: "professional",

            // 🔥 Save Cloudinary URL
            certificate: uploadResult.secure_url,

            professionType: dto.professionType,
            experience: dto.experience,
            city: dto.city,
            languages: dto.languages,
            createdBy: new mongoose.Types.ObjectId(adminId),
            services: dto.services,
            consultationFee: dto.consultationFee,
            practiceArea: dto.practiceArea,
            isActive: true,
            status: "approved" // since admin is creating
        });

        return professional;
    }

    // ✅ GET ALL
    async getAllProfessionals(query: any) {
        try {
            const page = Math.max(1, Number(query.page) || 1);
            const limit = Math.max(1, Number(query.limit) || 10);
            const skip = (page - 1) * limit;

            const matchStage: any = { isActive: true };

            // 🎯 Filter by city
            if (query.city) {
                matchStage.city = query.city;
            }

            // 🎯 Filter by professionType
            if (query.professionType) {
                matchStage.professionType = {
                    $regex: query.professionType,
                    $options: "i"
                };
            }

            // 💰 Fee filter
            if (query.minFee || query.maxFee) {
                matchStage.consultationFee = {};
                if (query.minFee) matchStage.consultationFee.$gte = Number(query.minFee);
                if (query.maxFee) matchStage.consultationFee.$lte = Number(query.maxFee);
            }

            const pipeline: any[] = [
                { $match: matchStage },

                // 🔗 join user
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userId"
                    }
                },
                { $unwind: "$userId" },

                // 🔗 join services
                {
                    $lookup: {
                        from: "services",
                        localField: "services",
                        foreignField: "_id",
                        as: "services"
                    }
                },

                // 🔍 SEARCH (name, title, professionType)
                ...(query.search
                    ? [{
                        $match: {
                            $or: [
                                { "userId.fullname": { $regex: query.search, $options: "i" } },
                                { "professionType": { $regex: query.search, $options: "i" } },
                                { "services.title": { $regex: query.search, $options: "i" } }
                            ]
                        }
                    }]
                    : []),

                // 🔽 sorting
                { $sort: { createdAt: -1 } },

                // 📄 pagination
                { $skip: skip },
                { $limit: limit }
            ];

            const professionals = await Professional.aggregate(pipeline);

            // 🔢 total count (separate pipeline)
            const countPipeline = [
                ...pipeline.filter(stage => !stage.$skip && !stage.$limit && !stage.$sort),
                { $count: "total" }
            ];

            const countResult = await Professional.aggregate(countPipeline);
            const total = countResult[0]?.total || 0;

            return {
                total,
                page,
                limit,
                professionals
            };

        } catch (error: any) {
            console.error("❌ Get Professionals Error:", error.message);
            throw new ApiError(500, "Failed to fetch professionals");
        }
    }

    // ✅ GET SINGLE
    async getProfessionalById(id: string) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid ID");
            }

            const professional = await Professional.findById(id)
                .populate("userId")
                .populate("services");

            if (!professional || !professional.isActive) {
                throw new ApiError(404, "Professional not found");
            }

            return professional;

        } catch (error: any) {
            console.error("❌ Get Professional Error:", error.message);

            if (error instanceof ApiError) throw error;

            throw new ApiError(500, "Failed to fetch professional");
        }
    }

    // ✅ UPDATE
    async updateProfessional(id: string, data: Partial<IProfessional>) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid ID");
            }

            // 🔥 validate fields if provided
            if (data.professionType) {
                const allowedTypes = ["Lawyer / Advocate", "Chartered Accountant", "Company Secretary"];
                if (!allowedTypes.includes(data.professionType)) {
                    throw new ApiError(400, "Invalid professionType");
                }
            }

            if (data.experience && (data.experience < 0 || data.experience > 60)) {
                throw new ApiError(400, "Invalid experience");
            }

            if (data.consultationFee && data.consultationFee < 0) {
                throw new ApiError(400, "Invalid consultation fee");
            }
            const allowedFields = [
                "professionType",
                "experience",
                "city",
                "languages",
                "consultationFee",
                "services",
                "practiceArea"
            ];

            const updateData: any = {};

            for (const key of Object.keys(data)) {
                if (!allowedFields.includes(key)) {
                    throw new ApiError(400, `Invalid field: ${key}`);
                }

                const value = data[key];

                // ❌ reject null / undefined
                if (value === null || value === undefined) {
                    throw new ApiError(400, `${key} cannot be null or undefined`);
                }

                // ❌ reject empty string
                if (typeof value === "string" && value.trim() === "") {
                    throw new ApiError(400, `${key} cannot be empty`);
                }

                updateData[key] = value;
            }
            const updated = await Professional.findByIdAndUpdate(
                id,
                data,
                { new: true, runValidators: true }
            );

            if (!updated) {
                throw new ApiError(404, "Professional not found");
            }

            return updated;

        } catch (error: any) {
            console.error("❌ Update Professional Error:", error.message);

            if (error instanceof ApiError) throw error;

            throw new ApiError(500, "Failed to update professional");
        }
    }



    // ✅ DELETE (SOFT DELETE)
    async softdeleteProfessional(id: string) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid ID");
            }

            const deleted = await Professional.findByIdAndUpdate(
                id,
                { isActive: false },
                { new: true }
            );

            if (!deleted) {
                throw new ApiError(404, "Professional not found");
            }

            return deleted;

        } catch (error: any) {
            console.error("❌ Delete Professional Error:", error.message);

            if (error instanceof ApiError) throw error;

            throw new ApiError(500, "Failed to delete professional");
        }
    }

    async deleteProfessional(id: string) {
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ApiError(400, "Invalid ID");
            }

            const deleted = await Professional.findByIdAndDelete(
                id);

            if (!deleted) {
                throw new ApiError(404, "Professional not found");
            }

            return deleted;

        } catch (error: any) {
            console.error("❌ Delete Professional Error:", error.message);

            if (error instanceof ApiError) throw error;

            throw new ApiError(500, "Failed to delete professional");
        }
    }


    async updateCertificateByAdmin(
        professionalId: string,
        file?: Express.Multer.File
    ) {
        // ✅ Check ID
        if (!mongoose.Types.ObjectId.isValid(professionalId)) {
            throw new ApiError(400, "Invalid professional ID");
        }

        // ✅ Find existing professional
        const professional = await Professional.findById(professionalId);

        if (!professional) {
            throw new ApiError(404, "Professional not found");
        }

        let newImageUrl = professional.certificate;
        let newImage = "";

        // ✅ If new file uploaded
        if (file) {
            // 🔥 Upload new image
            const uploadResult: any = await uploadToCloudinary(file.buffer);

            newImage = uploadResult.secure_url;

            // 🔥 Delete old image (IMPORTANT)
            if (newImageUrl) {
                await deleteFromCloudinary(newImageUrl);
            }
        }
        // ✅ Update image
        professional.certificate = newImage;


        await professional.save();

        return professional;
    }

    async updateCertificate(
        professionalId: string,
        file?: Express.Multer.File
    ) {
        // ✅ Check ID
        if (!mongoose.Types.ObjectId.isValid(professionalId)) {
            throw new ApiError(400, "Invalid professional ID");
        }

        // ✅ Find existing professional
        const professional = await Professional.findById(professionalId);

        if (!professional) {
            throw new ApiError(404, "Professional not found");
        }

        let newImageUrl = professional.certificate;
        let newImage = "";

        // ✅ If new file uploaded
        if (file) {
            // 🔥 Upload new image
            const uploadResult: any = await uploadToCloudinary(file.buffer);

            newImage = uploadResult.secure_url;

            // 🔥 Delete old image (IMPORTANT)
            if (newImageUrl) {
                await deleteFromCloudinary(newImageUrl);
            }
        }
        // ✅ Update image
        professional.certificate = newImage;


        await professional.save();

        return professional;
    }
}