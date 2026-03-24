import express from "express";
import { ProfessionalController } from './professional.controller.js';
import { upload } from "../../middlewares/upload.middleware.js";
import { adminOnly, verifyToken, professionalOnly, adminAndprofessional } from "../../middlewares/auth.middleware.js";
const router = express.Router();
const controller = new ProfessionalController();

// ✅ PUBLIC ROUTES
router.route("/")
    .get(controller.getAllProfessionals);

router.route("/")
    .post(verifyToken, adminOnly, upload.single('certificate'), controller.createProfessional);

// ✅ SINGLE PROFESSIONAL
router.route("/:id")
    .get(controller.getProfessionalById)
    .put(verifyToken, adminOnly, controller.updateProfessionalByAdmin)
    .delete(verifyToken, adminOnly, controller.deleteProfessional);

router.route('/soft-delete/:id').patch(verifyToken, adminOnly, controller.softdeleteProfessional)
router.route("/update-certificate/:id").patch(verifyToken, adminOnly, upload.single('certificate'), controller.updateCertificateByAdmin);
router.route("/update-certificate").patch(verifyToken, professionalOnly, upload.single('certificate'), controller.updateCertificate)
router.route("/").put(verifyToken,professionalOnly, controller.updateProfessional)
export default router;