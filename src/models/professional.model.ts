import mongoose, { Document } from "mongoose";

export interface IProfessional extends Document {
  // Auth / Registration (Professional fills)
  fullname: string;
  email: string;
  password: string;
  phone: string;

  // Verification / Docs
  certificate?: string;

  // Role & Status
  role: "professional";
  status: "pending" | "approved" | "rejected";

  // Admin Controlled Fields
  professionType: "Lawyer / Advocate" | "Chartered Accountant" | "Company Secretary";
  experience: number;
  city: string;
  languages: string[];
  consultationFee: number;
  services: mongoose.Types.ObjectId[];
  practiceArea: string[];

  // System Fields
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId; // admin
}

const professionalSchema = new mongoose.Schema<IProfessional>(
  {
    // 🔐 Registration Fields (Step 1)
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },

    certificate: {
      type: String
    },

    // 🧠 Role & Approval Flow
    role: {
      type: String,
      default: "professional"
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    // 🛠 Admin Fields (Step 2)
    professionType: {
      type: String,
      enum: ["Lawyer / Advocate", "Chartered Accountant", "Company Secretary"],
    },
    experience: {
      type: Number,
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
    practiceArea: [
      {
        type: String,
        trim: true
      }
    ],

    // ⚙️ System Fields
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);


// 🚀 Indexing (Search Optimization)
professionalSchema.index({ city: 1, professionType: 1 });
professionalSchema.index({ fullname: "text", practiceArea: "text" });

export const Professional = mongoose.model<IProfessional>(
  "Professional",
  professionalSchema
);