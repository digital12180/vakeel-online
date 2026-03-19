import express from "express";
import { ServiceController } from "./service.controller.js";
import { adminOnly, verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();
const controller = new ServiceController();

router.route('/')
  .post(verifyToken, adminOnly, controller.createService.bind(controller))
  .get(controller.getAllServices.bind(controller));

router.get("/:id", controller.getServiceById.bind(controller));
router.put("/:id", verifyToken, adminOnly, controller.updateService.bind(controller));
router.delete("/:id", verifyToken, adminOnly, controller.deleteService.bind(controller));

export default router;

