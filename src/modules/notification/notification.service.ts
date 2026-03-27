import { Notification } from "../../models/notification.model.js";
import { Types } from "mongoose";
import { ApiError } from "../../utils/apiError.js";
export class NotificationService {

  async getAllNotifications(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({ userId });
    const totalPages = Math.ceil(totalNotifications / limit);

    return {
      notifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotifications,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit,
      },
    };
  }

  async getSingleNotification(notificationId: string) {
    if (!Types.ObjectId.isValid(notificationId)) {
      throw new ApiError(400, "Invalid Notification ID");
    }

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }
    notification.isRead = true;
    await notification.save();
    return notification;
  }
}