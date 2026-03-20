// app/middleware/auth.middleware.ts
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model.js';
import { ROLES, ROLE_MAP, ROLE_REVERSE_MAP } from '../utils/constants.js';
import { ERROR_MESSAGES } from '../responses/message.js';
import { ApiResponse } from '../utils/apiResponse.js';

// Interface for token data
export interface TokenData {
    userId: string;
    role: number;
    roleName: string;
    user: any;
}

// Extend Express Request interface
declare global {
    namespace Express {
        interface Request {
            tokenData?: TokenData;
            user?: any;
        }
    }
}

// ✅ Get JWT Secret from environment (with fallbacks)
const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET;

    if (!secret) {
        console.warn('⚠️ JWT_SECRET not found in environment. Using fallback secret for development.');
        return 'development-fallback-secret-2024-change-in-production';
    }

    return secret;
};

// ✅ Get JWT Refresh Secret from environment
const getJwtRefreshSecret = (): string => {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.ULTRA_SECRET_KEY;

    if (!secret) {
        console.warn('⚠️ JWT_REFRESH_SECRET not found. Using JWT secret for refresh.');
        return getJwtSecret();
    }

    return secret;
};

// ✅ Token Generate Function - FIXED
export const generateToken = async (
    user: any,
    expiresIn: string = "7d"
): Promise<string> => {

    const userId = user._id || user.id;

    if (!userId) {
        throw new Error("User ID is required");
    }

    const payload = {
        userId: userId.toString(),
        role: user.role || "user",
        email: user.email || "",
    };

    const jwtSecret = getJwtSecret();

    if (!jwtSecret) {
        throw new Error("JWT Secret missing");
    }

    const options = {
        expiresIn: expiresIn,
        algorithm: "HS256" as const,
    };

    return await jwt.sign(payload, jwtSecret, options as jwt.SignOptions);
};

// ✅ Token Verify Middleware - UPDATED
export const verifyToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        // Check for token in multiple locations
        let token: string | undefined;

        // 1. Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.replace('Bearer ', '');
        }

        // 2. Check cookies
        else if (req.cookies?.token) {
            token = req.cookies.token;
        }

        // 3. Check query parameter
        else if (req.query?.token) {
            token = req.query.token as string;
        }

        if (!token) {
            return ApiResponse.error(res, ERROR_MESSAGES.NO_TOKEN, 401);
        }

        console.log("🔍 [DEBUG] Token found, verifying...");

        const jwtSecret = getJwtSecret();

        // Verify token
        const decoded = jwt.verify(token, jwtSecret) as any;

        console.log("🔍 [DEBUG] Token decoded:", {
            userId: decoded.userId,
            role: decoded.role,
            email: decoded.email
        });

        // Get role name from numeric role
        const roleName = ROLES[decoded.role];
        if (!roleName) {
            console.error("❌ Invalid role in token:", decoded.role);
            return ApiResponse.error(res, ERROR_MESSAGES.INVALID_ROLE, 403);
        }

        // Find user in database
        const user = await User.findById(decoded.userId)
            .select('-password')
            .lean();

        if (!user) {
            console.error("❌ User not found for ID:", decoded.userId);
            return ApiResponse.error(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
        }

        // Attach token data to request
        req.tokenData = {
            userId: decoded.userId,
            role: decoded.role,
            roleName: roleName,
            user: user,
        };

        // Also attach user directly to request for convenience
        req.user = user;

        console.log("✅ Token verified successfully for user:", user.email || user.phone);
        next();
    } catch (error: any) {
        console.error('❌ Token Verification Error:', error.message);

        if (error.name === 'JsonWebTokenError') {
            console.error('❌ JWT Error details:', error.message);
            return ApiResponse.error(res, ERROR_MESSAGES.INVALID_TOKEN, 401);
        }

        if (error.name === 'TokenExpiredError') {
            console.error('❌ Token expired at:', error.expiredAt);
            return ApiResponse.error(res, 'Token expired. Please login again.', 401);
        }

        console.error('❌ Unknown token error:', error);
        return ApiResponse.error(res, ERROR_MESSAGES.INVALID_TOKEN, 401);
    }
};

// ✅ Role Checking Middleware
export const checkRole = (allowedRoles: string[] = []) => {
    return (req: Request, res: Response, next: NextFunction): Response | void => {
        try {
            const userRole = req.tokenData?.roleName;

            if (!userRole) {
                return ApiResponse.error(res, ERROR_MESSAGES.NO_TOKEN, 401);
            }

            if (!allowedRoles.includes(userRole)) {
                console.error(`❌ Access denied. User role: ${userRole}, Allowed: ${allowedRoles}`);
                return ApiResponse.error(res, ERROR_MESSAGES.ACCESS_DENIED, 403);
            }

            next();
        } catch (error) {
            console.error('❌ Role check error:', error);
            return ApiResponse.error(res, ERROR_MESSAGES.SERVER_ERROR, 500);
        }
    };
};

// ✅ Admin Only Middleware (Shortcut)
export const adminOnly = checkRole([ROLES.admin]);
export const userAndadmin=checkRole([ROLES.admin,ROLES.user]);
export const adminAndprofessionalAnduser=checkRole([ROLES.admin,ROLES.user,ROLES.professional]);

export const adminAndprofessional = checkRole([ROLES.admin, ROLES.professional])
// ✅ User Only Middleware (Shortcut)
export const userOnly = checkRole([ROLES.user]);
export const professionalOnly = checkRole([ROLES.professional]);

//✅ Refresh Token Middleware (if needed) - UPDATED
export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return ApiResponse.error(res, 'Refresh token required', 401);
        }

        const jwtRefreshSecret = getJwtRefreshSecret();
        const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as any;
        const user = await User.findById(decoded.userId);

        if (!user) {
            return ApiResponse.error(res, ERROR_MESSAGES.USER_NOT_FOUND, 404);
        }

        // Generate new access token
        const newAccessToken = generateToken(user, '15m');

        // Attach to response
        res.locals.newAccessToken = newAccessToken;
        res.locals.user = user;

        next();
    } catch (error: any) {
        console.error('❌ Refresh token error:', error.message);
        return ApiResponse.error(res, 'Invalid refresh token', 401);
    }
};

// ✅ Rate Limiting Middleware (Basic)
export const rateLimit = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req: Request, res: Response, next: NextFunction): Response | void => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        for (const [key, timestamps] of requests.entries()) {
            requests.set(
                key,
                timestamps.filter((timestamp: number) => timestamp > windowStart)
            );
        }

        const userRequests = requests.get(ip) || [];

        if (userRequests.length >= maxRequests) {
            return ApiResponse.error(
                res,
                'Too many requests. Please try again later.',
                429
            );
        }

        userRequests.push(now);
        requests.set(ip, userRequests);

        next();
    };
};