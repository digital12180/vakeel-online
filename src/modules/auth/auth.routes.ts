import { AuthController } from "./auth.controller.js";
import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";


const router = Router();
const authcontroller = new AuthController();

router.route('/user/register').post(authcontroller.UserRegister);
router.route('/admin/register').post(authcontroller.AdminRegister);
router.route('/professional/register').post(upload.single('certificate'), authcontroller.ProfessionalRegister);
router.route('/login').post(authcontroller.login);
router.route('/logout').post(verifyToken, authcontroller.logout);
router.route('/refresh-token').get(verifyToken, authcontroller.refreshToken);
router.route('/profile').get(verifyToken, authcontroller.getProfile);
router.route('/update-profile').put(verifyToken, authcontroller.updateProfile);

export default router;


