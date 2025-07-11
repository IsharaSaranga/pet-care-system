import express from "express";
import {
  sendEventNotification,
  getEventNotifications,
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/event/:id/send", sendEventNotification);
router.get("/event/:id", getEventNotifications);
router.get("/user", auth, getUserNotifications);
router.patch("/:id/read", auth, markNotificationAsRead);

export default router;