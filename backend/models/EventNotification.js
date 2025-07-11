import mongoose from "mongoose";

const eventNotificationSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["admin", "user"],
    required: true,
    default: "user",
  },
  read: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Add a unique index to prevent duplicate notifications
eventNotificationSchema.index({ eventId: 1, userId: 1, content: 1 }, { unique: true });

// Index for efficient querying
eventNotificationSchema.index({ eventId: 1, type: 1 });
eventNotificationSchema.index({ userId: 1, type: 1 });

export default mongoose.model("EventNotification", eventNotificationSchema);