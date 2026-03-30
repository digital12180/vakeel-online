import express from "express";
import { ChatController } from "./chat.controller.js";

const router = express.Router();
const controller = new ChatController();

router.post("/send", controller.sendMessage.bind(controller));
router.get("/:roomId", controller.getMessages.bind(controller));

export default router;