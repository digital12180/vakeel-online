import authRoutes from "./modules/auth/auth.routes.js";
import serviceRoutes from "./modules/service/service.routes.js";
import professionalRoutes from "./modules/professionals/professional.routes.js"
import consultationRoutes from "./modules/consultations/consultation.routes.js";
import { Router } from "express";

const router=Router();

router.use('/auth',authRoutes);
router.use('/service',serviceRoutes);
router.use('/professional',professionalRoutes);
router.use('/consultation',consultationRoutes);

export default router;
