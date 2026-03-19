import express from "express";
import { ProfessionalController } from './professional.controller.js';
import { adminOnly, verifyToken, professionalOnly, adminAndprofessional } from "../../middlewares/auth.middleware.js";
const router = express.Router();
const controller = new ProfessionalController();

// ✅ PUBLIC ROUTES
router.route("/")
    .get(controller.getAllProfessionals);

// ✅ CREATE (User or Admin)
router.route("/")
    .post(verifyToken, adminAndprofessional, controller.createProfessional);

// ✅ SINGLE PROFESSIONAL
router.route("/:id")
    .get(controller.getProfessionalById)
    .put(verifyToken, adminAndprofessional, controller.updateProfessional)
    .delete(verifyToken, adminOnly, controller.deleteProfessional);

router.route('/soft-delete/:id').delete(verifyToken, adminOnly, controller.softdeleteProfessional)

export default router;