import mongoose from "mongoose";

export interface IProfessional {
    userId: mongoose.Types.ObjectId;
    professionType: string;
    experience: number;
    city: string;
    languages: string[];
    consultationFee: number;
    services: mongoose.Types.ObjectId[];
    isActive?: boolean;
    practiceArea: string[];
    createdBy: mongoose.Types.ObjectId;
}
const professionalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    professionType: {
        type: String,
        enum: ['All', 'Lawyer / Advocate', 'Chartered Accountant', 'Company Secretary'],
        required: true
    },
    experience: {
        type: Number, // in years
        required: true,
        min: 0
    },
    city: {
        type: String
    },
    languages: [
        {
            type: String
        }
    ],
    consultationFee: {
        type: Number,
        min: 0
    },
    services: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service"
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    practiceArea: [{
        type: String,
        trim: true
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, { timestamps: true });

professionalSchema.index({ city: 1, professionType: 1 });
export const Professional = mongoose.model("Professional", professionalSchema);