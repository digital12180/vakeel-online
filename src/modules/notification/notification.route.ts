import { NotificationController } from "./notification.controller.js";
import express from "express";
import { verifyToken, userOnly } from "../../middlewares/auth.middleware.js";

const controller=new NotificationController();
const router = express.Router();

router.route('/get-all-notification').get(verifyToken, userOnly, controller.getAllNotifications);
router.route('/get-y-id/:id').get(verifyToken, userOnly, controller.getSingleNotification);


export default router;