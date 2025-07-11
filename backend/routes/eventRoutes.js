import express from "express";
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.post("/", upload.single("eventImage"), createEvent);
router.get("/", getAllEvents);
router.get("/:id", getEventById);
router.put("/:id", upload.single("eventImage"), updateEvent);
router.delete("/:id", deleteEvent);

export default router;