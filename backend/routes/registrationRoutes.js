import express from "express";
import {
  createRegistrationSession,
  confirmRegistrationPayment,
  getRegistrationsByEvent,
  getUserRegistrations,
  cancelRegistration,
  updateRegistrationTickets,
  confirmUpdatePayment,
} from "../controllers/registrationController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/:id/register", auth, createRegistrationSession);
router.post("/confirm", auth, confirmRegistrationPayment);
router.get("/event/:id", getRegistrationsByEvent);
router.get("/user", auth, getUserRegistrations);
router.patch("/:id/cancel", auth, cancelRegistration);
router.patch("/:id/update-tickets", auth, updateRegistrationTickets);
router.post("/confirm-update", auth, confirmUpdatePayment);

export default router;