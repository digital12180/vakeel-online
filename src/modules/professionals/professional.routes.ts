import express from "express";
import { ProfessionalController } from './professional.controller.js';
import { adminOnly, verifyToken, professionalOnly, adminAndprofessional } from "../../middlewares/auth.middleware.js";
const router = express.Router();
const controller = new ProfessionalController();

// ✅ PUBLIC ROUTES
router.route("/")
    .get(controller.getAllProfessionals);

router.route("/")
    .post(verifyToken,adminOnly, controller.createProfessional);

// ✅ SINGLE PROFESSIONAL
router.route("/:id")
    .get(controller.getProfessionalById)
    .put(verifyToken, adminAndprofessional, controller.updateProfessional)
    .delete(verifyToken, adminOnly, controller.deleteProfessional);

router.route('/soft-delete/:id').patch(verifyToken, adminOnly, controller.softdeleteProfessional)

export default router;