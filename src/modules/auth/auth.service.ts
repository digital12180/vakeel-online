import { generateToken, refreshToken } from '../../middlewares/auth.middleware.js';
import { Professional } from '../../models/professional.model.js';
import bcrypt from "bcryptjs"
import type {
    RegisterDto,
    LoginDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    RegisterResponseDto,
    UserLoginResponseDto,
    ProLoginResponseDto,
    AdminLoginResponseDto,
    ProRegisterDto,
    RegisterProfessionalDto
} from './auth.dtos.js';
import { ApiError } from '../../utils/apiError.js';
import { User } from '../../models/user.model.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../responses/message.js';

export class AuthService {
    // ==================== STEP 3: REGISTER ====================
    async UserRegister(registerDto: RegisterDto): Promise<RegisterResponseDto> {
        const { fullname, email, password, phone } = registerDto;

        try {

            // ✅ Validate email
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!isValidEmail) {
                throw new ApiError(400, "Invalid email format");
            }
            const strongPassword = /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^0-9A-Za-z]).{8,32}$/

            const isStrongPassword = strongPassword.test(password);
            if (!isStrongPassword) {
                throw new ApiError(400, "Password must conatin at least one lowercase , uppercase ,special character ,digit. length should be 8 character. ");
            }
            // ✅ Check if user already exists
            const existingUser = await User.findOne({ email: email }).select("-password");
            if (existingUser) {
                throw new ApiError(409, "User already exists with this email");
            }

            // ✅ Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // ✅ Create user object
            const userData: any = {
                fullname,
                email,
                password: hashedPassword,
                role: 'user',
            };

            if (phone) {
                userData.phone = phone;
            }

            // ✅ Save user
            const user = await User.create(userData);

            console.log("✅ User registered:", {
                id: user._id,
                email: user.email
            });

            return {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone ?? null,
                role: user.role ?? 'user',
            }
        } catch (error: any) {
            console.error("❌ Register error:", error.message);
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(500, "User registration failed");
        }
    }

    async AdminRegister(registerDto: RegisterDto): Promise<RegisterResponseDto> {
        const { fullname, email, password } = registerDto;

        try {

            // ✅ Validate email
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!isValidEmail) {
                throw new ApiError(400, "Invalid email format");
            }
            const strongPassword = /^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^0-9A-Za-z]).{8,32}$/

            const isStrongPassword = strongPassword.test(password);
            if (!isStrongPassword) {
                throw new ApiError(400, "Password must conatin at least one lowercase , uppercase ,special character ,digit. length should be 8 character. ");
            }
            // ✅ Check if user already exists
            const existingUser = await User.findOne({ email: email }).select("-password");
            if (existingUser) {
                throw new ApiError(409, "User already exists with this email");
            }

            // ✅ Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // ✅ Create user object
            const userData: any = {
                fullname,
                email,
                password: hashedPassword,
                role: "admin",
            };

            // ✅ Save user
            const user = await User.create(userData);

            console.log("✅ Admin registered:", {
                id: user._id,
                email: user.email
            });

            return {
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role ?? "admin"
            }
        } catch (error: any) {
            console.error("❌ Register error:", error.message);
            if (error instanceof ApiError) {
                throw error;
            }

            throw new ApiError(500, "User registration failed");
        }
    }

    async ProfessionalRegister(dto: ProRegisterDto) {
        const {
            fullname,
            email,
            password,
            phone,
            certificate,
            professionType,
            experience,
            city,
            languages
        } = dto;

        // ✅ validations
        if (!fullname || !email || !password || !certificate || !phone) {
            throw new ApiError(400, "All required fields missing");
        }

        const existing = await User.findOne({ email });
        if (existing) {
            throw new ApiError(409, "Email already exists");
        }

        const hashed = await bcrypt.hash(password, 10);


        // ✅ create professional profile (inactive by default)
        const professional = await Professional.create({
            fullname,
            email,
            password: hashed,
            phone,
            role: "professional",
            certificate,
            professionType,
            experience,
            city,
            languages,
            isActive: false // 🔥 IMPORTANT
        });

        return {
            message: "Registered successfully. Waiting for admin approval",
            professional
        };
    }

    // ==================== STEP 4: LOGIN ====================
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        if (!email || !password) {
            throw new ApiError(400, "Email & Password required");
        }
        let accessToken = "";
        let refreshToken = "";
        let Data = {};
        const user = await User.findOne({ email });

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new ApiError(401, "Invalid credentials");
            }

            const objData = user.toObject();
            delete objData.password;
            Data = objData;
            accessToken = await generateToken({
                id: user._id,
                role: user.role,
                email: user.email
            });
            refreshToken = await generateToken({
                id: user._id,
                role: user.role,
                email: user.email
            });
        }
        else if (!user) {
            const professional = await Professional.findOne({ email });
            const isMatch = await bcrypt.compare(password, professional.password);
            if (!isMatch) {
                throw new ApiError(401, "Invalid credentials");
            }
            const objData = professional.toObject();
            delete objData.password;
            Data = objData;

            accessToken = await generateToken({
                id: professional._id,
                role: professional.role,
                email: professional.email
            });
            refreshToken = await generateToken({
                id: professional._id,
                role: professional.role,
                email: professional.email
            });
        } else {
            throw new ApiError(401, "Invalid credentials");
        }



        // 🔥 PROFESSIONAL CHECK
        // if (user.role === "professional") {
        //     professionalData = await Professional.findOne({
        //         userId: user._id
        //     });

        //     if (!professionalData) {
        //         throw new ApiError(403, "Professional profile not found");
        //     }

        //     if (!professionalData.isActive) {
        //         throw new ApiError(403, "Your account is not approved yet");
        //     }
        // }

        // const accessToken = await generateToken({
        //     id: user._id,
        //     role: user.role
        // });
        // const refreshToken = await generateToken({
        //     id: user._id,
        //     role: user.role
        // });

        return {
            user: Data,
            accessToken,
            refreshToken
        };
    }
    // ==================== STEP 5: FORGOT PASSWORD ====================
    // async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<SendOtpResponseDto> {
    //     const { identifier } = forgotPasswordDto;

    //     // ✅ DEVELOPMENT: Always send OTP
    //     if (process.env.NODE_ENV === 'development') {
    //         console.log(`🔧 [DEV] Forgot password for: ${identifier}`);
    //         return this.sendOtp({
    //             identifier,
    //             type: 'forgot_password',
    //         });
    //     }

    //     // Production: Check if user exists
    //     const user = await this.userRepository.findByEmailOrPhone(identifier);
    //     if (!user) {
    //         // Don't reveal if user exists
    //         return {
    //             sessionId: 'dummy-session',
    //             message: ERROR_MESSAGES.FORGOT_PASSWORD_OTP_MESSAGE,
    //             expiresIn: 0,
    //         };
    //     }

    //     // Use existing sendOtp method
    //     return this.sendOtp({
    //         identifier,
    //         type: 'forgot_password',
    //     });
    // }

    // ==================== STEP 6: RESET PASSWORD ====================
    // async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    //     const { sessionId, password, confirmPassword } = resetPasswordDto;

    //     // Get verified session
    //     const session = await this.verificationRepository.getVerifiedSession(sessionId);
    //     if (!session) {
    //         throw new ApiError(400, ERROR_MESSAGES.SESSION_EXPIRED_NOT_VERIFIED);
    //     }

    //     // Validate session type
    //     if (session.type !== 'forgot_password') {
    //         throw new ApiError(400, ERROR_MESSAGES.INVALID_SESSION_TYPE_PASSWORD_RESET);
    //     }

    //     // ✅ FIX: Use password utility for validation
    //     try {
    //         // ✅ PASSWORD NORMALIZATION: Add here
    //         const cleanPassword = password.normalize('NFKC');
    //         const cleanConfirmPassword = confirmPassword.normalize('NFKC');

    //         console.log("🔍 Password normalization applied for reset:");
    //         console.log("  - Original password length:", password.length);
    //         console.log("  - Clean password length:", cleanPassword.length);
    //         console.log("  - Original confirm password length:", confirmPassword.length);
    //         console.log("  - Clean confirm password length:", cleanConfirmPassword.length);

    //         const { hash: hashedPassword } = await passwordEncryptor.preparePasswordForRegistration(
    //             cleanPassword,
    //             cleanConfirmPassword
    //         );

    //         // Find user by identifier
    //         const user = await this.userRepository.findByEmailOrPhone(session.identifier);
    //         if (!user) {
    //             throw new ApiError(404, ERROR_MESSAGES.USER_NOT_FOUND);
    //         }

    //         // Update password using utility hash
    //         await this.userRepository.updateById(user._id.toString(), { password: hashedPassword });

    //         // Delete verification session
    //         await this.verificationRepository.deleteOne({ sessionId });

    //         // Send notification email if reset via email
    //         if (session.identifier.includes('@')) {
    //             await EmailService.sendPasswordResetEmail(
    //                 session.identifier,
    //                 `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
    //                 user.name
    //             );
    //         }

    //         return { message: SUCCESS_MESSAGES.PASSWORD_RESET };

    //     } catch (error: any) {
    //         console.error("❌ Password reset failed:", error.message);
    //         throw new ApiError(400, ERROR_MESSAGES.PASSWORD_RESET_FAILED);
    //     }
    // }


    // AuthService class ke last mein, `cleanupExpiredSessions` ke baad:

    // ==================== PROFILE METHODS ====================

    /**
     * Get user profile
     */
    async getProfile(userId: string): Promise<any> {
        try {
            console.log("🔍 [DEBUG] Getting profile for user ID:", userId);

            const user = await User.findById({ _id: userId }).select("-password -__v");

            if (!user) {
                console.error("❌ User not found for ID:", userId);
                throw new ApiError(404, ERROR_MESSAGES.USER_NOT_FOUND);
            }

            console.log("✅ Profile found:", {
                id: user._id,
                fullname: user.fullname,
                email: user.email
            });

            // Return profile without sensitive data
            const profile = {
                _id: user._id.toString(),
                fullname: user.fullname,
                email: user.email,
                phone: user.phone ?? null,
                role: user.role || 'user',
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };

            return profile;
        } catch (error: any) {
            console.error("❌ Profile fetch error:", error.message);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, 'Failed to fetch profile');
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, updateData: any): Promise<any> {
        try {
            console.log("🔍 [DEBUG] Updating profile for user ID:", userId);
            console.log("📝 Update data:", updateData);

            // Remove sensitive fields
            const { phone } = updateData;

            if (!phone) {
                throw new ApiError(400, "Updated fields required")
            }

            const user = await User.findByIdAndUpdate({ _id: userId as string });

            if (!user) {
                console.error("❌ User not found for update:", userId);
                throw new ApiError(404, ERROR_MESSAGES.USER_NOT_FOUND);
            }
            user.phone = phone ?? user.phone;
            await user.save();
            return {
                _id: user._id.toString(),
                fullname: user.fullname,
                email: user.email,
                phone: user.phone,
                role: user.role,
                message: SUCCESS_MESSAGES.PROFILE_UPDATED,
            };
        } catch (error: any) {
            console.error("❌ Profile update error:", error.message);
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, 'Failed to update profile');
        }
    }

    //   // ==================== ADMIN REGISTRATION ====================
    // async registerAdmin(registerDto: RegisterDto): Promise<AuthResponseDto> {
    //   // Check if admin already exists
    //   const adminExists = await this.userRepository.exists({ role: 'admin' });

    //   console.log("🔍 [DEBUG] Admin registration check:");
    //   console.log("  - Admin exists in system:", adminExists);

    //   // If admin exists, require token validation (handled by middleware)
    //   if (adminExists) {
    //     console.log("✅ Admin exists - using normal admin registration flow");

    //     // Similar to user registration but with admin role
    //     const authResponse = await this.register(registerDto);

    //     // Update user role to admin
    //     await this.userRepository.updateById(authResponse.user._id, { role: 'admin' });

    //     // Update response
    //     authResponse.user.role = 'admin';

    //     return authResponse;
    //   } else {
    //     // FIRST ADMIN REGISTRATION - No token required
    //     console.log("🚀 FIRST ADMIN REGISTRATION - No token required");

    //     // Use normal registration flow
    //     const authResponse = await this.register(registerDto);

    //     // Set role as admin
    //     await this.userRepository.updateById(authResponse.user._id, { role: 'admin' });

    //     // Update response
    //     authResponse.user.role = 'admin';

    //     console.log("✅ First admin registered successfully!");
    //     console.log("   Email:", authResponse.user.email);
    //     console.log("   Role: admin");

    //     return authResponse;
    //   }
    // }

    // ==================== HELPER: CHECK IF SYSTEM HAS ADMIN ====================
    async hasAdmin(): Promise<boolean> {
        return await User.findOne({ role: 'admin' });
    }
}