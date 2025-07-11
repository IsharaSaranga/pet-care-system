import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    tickets: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "active", "cancelled"],
      default: "pending",
    },
    paymentIntentId: { type: String },
    pendingPaymentIntentId: { type: String },
    paymentDate: { type: Date },
    registeredAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    cancelledAt: { type: Date },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "completed", "failed"],
      default: "none",
    },
    refundAmount: { type: Number, default: 0 },
    refundedAt: { type: Date },
    originalTickets: { type: Number },
    cancellationReason: { type: String }, // New field for cancellation reason
  },
  { timestamps: true }
);

export default mongoose.model("Registration", registrationSchema);