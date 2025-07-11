import mongoose from "mongoose";

const appointmentTempSchema = new mongoose.Schema({
  professionalId: {
    type: String,
    required: true,
  },
  professionalType: {
    type: String,
    enum: ["vet", "groomer", "pet-trainer"], // Updated to use "vet"
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
  chargePerAppointment: {
    type: Number,
    required: true,
    min: 0,
  },
  specialNotes: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Appointment_temp_availability", appointmentTempSchema);