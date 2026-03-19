
// Step 3: Register
export interface RegisterDto {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    role: 'user';
}

// Step 4: Login
export interface LoginDto {
    email: string;
    password: string;
}

// Step 5: Forgot Password
export interface ForgotPasswordDto {
    identifier: string; // email or phone
}

// Step 6: Reset Password
export interface ResetPasswordDto {
    sessionId: string;
    password: string;
    confirmPassword: string;
}

// Step 7: Admin Register (Special for first admin)
export interface AdminRegisterDto {
    sessionId: string;
    name: string;
    identifier?: string;
    password: string;
    confirmPassword: string;
    gender?: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    adminSecret?: string; // ✅ NEW: For first admin registration
}



export interface LoginResponseDto {
    user: {
        _id: string;
        fullname: string;
        email: string;
        phone?: string;
        role: 'user';
    };
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}
export interface RegisterResponseDto {
    _id: string;
    fullname: string;
    email: string;
    phone?: string;
    role: 'user';
}