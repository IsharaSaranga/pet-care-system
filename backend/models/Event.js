import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  eventImageURL: { type: String, default: "" },
  maxAttendees: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["active", "cancelled", "completed"], default: "active" },
  paymentGatewayId: { type: String },
  registeredTickets: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  // New field for refund policy
  refundPolicy: {
    minDays: {
      type: Number,
      default: () => parseInt(process.env.REFUND_DAYS_MIN) || 2,
    },
    maxDays: {
      type: Number,
      default: () => parseInt(process.env.REFUND_DAYS_MAX) || 7,
    },
    percentage: {
      type: Number,
      default: () => parseInt(process.env.REFUND_PERCENTAGE) || 50,
    },
  },
});

eventSchema.pre("save", function (next) {
  if (this.status) {
    this.status = this.status.toLowerCase();
  }
  if (this.registeredTickets < 0 || this.registeredTickets > this.maxAttendees) {
    return next(new Error("Registered tickets must be between 0 and maxAttendees"));
  }
  next();
});

export default mongoose.model("Event", eventSchema);