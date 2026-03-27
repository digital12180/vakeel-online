import type { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service.js";
import { ApiError } from "../../utils/apiError.js";

export class NotificationController {
  private notificationService = new NotificationService();

  // ✅ Get All Notifications
  getAllNotifications = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const userId = (req as any).user?._id;

      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const data = await this.notificationService.getAllNotifications(
        userId,
        page,
        limit
      );

      return res.status(200).json({
        message: "Notifications fetched successfully",
        ...data,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ Get Single Notification
  getSingleNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const notificationId = req.params.id;

      if (!notificationId) {
        throw new ApiError(400, "Notification Id required");
      }

      const notification =
        await this.notificationService.getSingleNotification(notificationId);

      return res.status(200).json({
        message: "Notification fetched successfully",
        notification,
      });
    } catch (error) {
      next(error);
    }
  };
}