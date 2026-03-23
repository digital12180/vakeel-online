import mongoose, { Document, Schema } from "mongoose"

export interface IUser extends Document {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    certificate?:string;
}

const userSchema = new Schema<IUser>({
    fullname: {
        type: String,
        trim: true,
        required: [true, 'Fullname Required']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Email Required'],
        unique: true
    },
    password: {
        type: String,
        trim: true,
        required: [true, 'Password Required']
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'professional'],
        required:true
    },
    certificate: {
        type: String, // URL (Cloudinary)
    },
}, {
    timestamps: true
})

// Check if model exists before creating new one (previses overwrite error)
export const User = mongoose.model<IUser>('User', userSchema);
