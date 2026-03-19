import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { ApiError } from '../../utils/apiError.js';
import type {
  RegisterDto,
  LoginDto,
} from './auth.dtos.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // ==================== STEP 3: REGISTER USER ====================
  register = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
    try {
      const registerDto: RegisterDto = req.body;
      const result = await this.authService.register(registerDto)

      return ApiResponse.success(res, result, 'Registration successful');
    } catch (error) {
      next(error);
    }
  };

  // // ==================== REGISTER ADMIN ====================
  // registerAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   try {
  //     const registerDto: RegisterDto = req.body;

  //     // ✅ Check if admin already exists
  //     const adminExists = await this.authService.hasAdmin();

  //     if (adminExists) {
  //       // Existing admin check - verify token
  //       const token = req.headers.authorization?.replace('Bearer ', '');
  //       if (!token) {
  //         throw new ApiError(401, 'Admin token required for additional admin registration');
  //       }
  //     } else {
  //       // First admin - no token required
  //       console.log("🚀 First admin registration - skipping token check");
  //     }

  //     const result = await this.authService.registerAdmin(registerDto);

  //     // Set refresh token in HTTP-only cookie
  //     res.cookie('refreshToken', result.refreshToken, {
  //       httpOnly: true,
  //       secure: process.env.NODE_ENV === 'production',
  //       sameSite: 'strict',
  //       maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  //     });

  //     ApiResponse.success(res, result, 'Admin registration successful');
  //   } catch (error) {
  //     next(error);
  //   }
  // };

  // ==================== STEP 4: LOGIN ====================
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;
      const result = await this.authService.login(loginDto);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
      console.log(error);
    }
  };

  //   // ==================== STEP 5: FORGOT PASSWORD ====================
  //   forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //     try {
  //       const forgotPasswordDto: ForgotPasswordDto = req.body;
  //       const result = await this.authService.forgotPassword(forgotPasswordDto);

  //       ApiResponse.success(res, result, result.message);
  //     } catch (error) {
  //       next(error);
  //     }
  //   };

  // ==================== STEP 6: RESET PASSWORD ====================
  //   resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //     try {
  //       const resetPasswordDto: ResetPasswordDto = req.body;
  //       const result = await this.authService.resetPassword(resetPasswordDto);

  //       ApiResponse.success(res, null, result.message);
  //     } catch (error) {
  //       next(error);
  //     }
  //   };

  // ==================== OTHER AUTH ENDPOINTS ====================
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        throw new ApiError(401, 'Refresh token required');
      }

      // Implement refresh token logic
      // const result = await this.authService.refreshToken(refreshToken);

      // For now, return error as this needs JWT implementation
      throw new ApiError(501, 'Refresh token functionality not implemented');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id || req.tokenData?.userId;

      if (!userId) {
        throw new ApiError(401, 'Authentication required');
      }

      const profile = await this.authService.getProfile(userId);
      ApiResponse.success(res, profile, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?._id || req.tokenData?.userId;

      if (!userId) {
        throw new ApiError(401, 'Authentication required');
      }

      const profile = await this.authService.updateProfile(userId, req.body);
      ApiResponse.success(res, profile, 'Profile updated');
    } catch (error) {
      next(error);
    }
  };
}