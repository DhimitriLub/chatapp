import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, markMessagesSeen, getUnreadCounts } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage)
router.put("/seen/:id", protectRoute, markMessagesSeen)
router.get("/unread-counts", protectRoute, getUnreadCounts)

export default router;