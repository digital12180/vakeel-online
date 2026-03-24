import express from "express";
import { ConsultationController } from "./consultation.controller.js";
import { verifyToken, adminAndprofessionalAnduser, adminAndprofessional, userOnly, userAndadmin, adminOnly } from "../../middlewares/auth.middleware.js";

const router = express.Router();
const controller = new ConsultationController();

// ✅ USER
router.post("/:id", verifyToken, userOnly, controller.createRequest);

// ✅ GET
router.get("/", verifyToken, adminAndprofessionalAnduser, controller.getAllRequests);
router.get("/:id", verifyToken, adminAndprofessionalAnduser, controller.getRequestById);

// ✅ PROFESSIONAL / ADMIN
router.put("/:id/status", verifyToken, adminAndprofessional, controller.updateStatus);

// ✅ DELETE
router.delete("/:id", verifyToken, userAndadmin, controller.deleteRequest);

router.post("/:id/assign", verifyToken, adminOnly, controller.assignProfessionalByAdmin);
export default router;