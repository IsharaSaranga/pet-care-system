import express from "express";
import {
  getRegistrationsPerEvent,
  getRevenuePerEvent,
  getRegistrationTrends,
  getEventStatusBreakdown,
  getRegistrationsByLocation,
  getRefundedRegistrations,
} from "../controllers/reportController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

// Get total registrations per event (requires auth, admin)
router.get("/registrations-per-event",  getRegistrationsPerEvent);

// Get revenue per event (requires auth, admin)
router.get("/revenue-per-event", getRevenuePerEvent);

// Get registration trends over time (requires auth, admin)
router.get("/registration-trends",  getRegistrationTrends);

// Get event status breakdown (requires auth, admin)
router.get("/event-status-breakdown",  getEventStatusBreakdown);

// Get registrations by location (requires auth, admin)
router.get("/registrations-by-location", getRegistrationsByLocation);

// Get refunded registrations (requires auth, admin)
router.get("/refunded-registrations", getRefundedRegistrations);

export default router;