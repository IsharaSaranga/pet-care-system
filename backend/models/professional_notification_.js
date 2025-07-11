import mongoose from "mongoose";

const professionalNotificationSchema = new mongoose.Schema({
  professionalId: {
    type: String,
    required: true,
  },
  professionalName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  charge: {
    type: Number,
    required: true,
    min: 0,
  },
  notificationType: {
    type: String,
    enum: ["appointment_accepted", "appointment_denied"],
    default: "appointment_accepted",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ProfessionalNotification", professionalNotificationSchema);