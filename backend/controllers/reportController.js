import Registration from "../models/Registration.js";
import Event from "../models/Event.js";

// Get total registrations per event
export const getRegistrationsPerEvent = async (req, res) => {
  try {
    const registrations = await Registration.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: "$eventId",
          totalRegistrations: { $sum: "$tickets" },
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
      {
        $project: {
          eventTitle: "$eventDetails.title",
          totalRegistrations: 1,
        },
      },
    ]);
    res.json({ success: true, data: registrations });
  } catch (err) {
    console.error("Error fetching registrations per event:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get revenue per event with date filter
export const getRevenuePerEvent = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { status: "active", paymentStatus: "paid" };
    if (startDate && endDate) {
      matchStage.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const registrations = await Registration.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
      {
        $group: {
          _id: "$eventId",
          totalTickets: { $sum: "$tickets" },
          totalRefundAmount: { $sum: { $ifNull: ["$refundAmount", 0] } },
          eventPrice: { $first: "$eventDetails.price" },
          eventTitle: { $first: "$eventDetails.title" },
        },
      },
      {
        $project: {
          eventTitle: 1,
          totalRevenue: {
            $subtract: [
              { $multiply: ["$totalTickets", { $ifNull: ["$eventPrice", 0] }] },
              "$totalRefundAmount",
            ],
          },
        },
      },
    ]);
    res.json({ success: true, data: registrations });
  } catch (err) {
    console.error("Error fetching revenue per event:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get registration trends over time with date filter
export const getRegistrationTrends = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { status: "active" };
    if (startDate && endDate) {
      matchStage.registeredAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const registrations = await Registration.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$registeredAt" },
          },
          totalRegistrations: { $sum: "$tickets" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data: registrations });
  } catch (err) {
    console.error("Error fetching registration trends:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get event status breakdown
export const getEventStatusBreakdown = async (req, res) => {
  try {
    const statuses = await Event.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    res.json({ success: true, data: statuses });
  } catch (err) {
    console.error("Error fetching event status breakdown:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get registrations by location
export const getRegistrationsByLocation = async (req, res) => {
  try {
    const registrations = await Registration.aggregate([
      { $match: { status: "active" } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
      {
        $group: {
          _id: "$eventDetails.location",
          totalRegistrations: { $sum: "$tickets" },
        },
      },
    ]);
    res.json({ success: true, data: registrations });
  } catch (err) {
    console.error("Error fetching registrations by location:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get refunded registrations
export const getRefundedRegistrations = async (req, res) => {
  try {
    const data = await Registration.aggregate([
      { $match: { status: "cancelled", refundStatus: "completed" } },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "eventDetails",
        },
      },
      { $unwind: "$eventDetails" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          eventTitle: "$eventDetails.title",
          userName: "$userDetails.name",
          userEmail: "$userDetails.email",
          tickets: 1,
          refundAmount: 1,
          cancelledAt: 1,
        },
      },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching refunded registrations:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};