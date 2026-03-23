
import express from "express";
import { UserController } from './user.controller.js';
import { adminOnly, verifyToken, professionalOnly, adminAndprofessional, userOnly } from "../../middlewares/auth.middleware.js";
const router = express.Router();
const controller = new UserController();


router.route("/talk-to-professional")
    .post(verifyToken,userOnly, controller.talkToProfessional);

export default router;