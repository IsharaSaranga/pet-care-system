import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctorId: {
    type: String,
    required: [true, "Doctor ID is required"],
    index: true,
  },
  appointmentDate: {
    type: Date,
    required: [true, "Appointment date is required"],
    validate: {
      validator: function (v) {
        return v >= new Date(); // Must be today or future
      },
      message: "Appointment date must be in the future",
    },
  },
  appointmentTime: {
    type: String,
    required: [true, "Appointment time is required"],
  },
  userName: {
    type: String,
    required: [true, "User name is required"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  phoneNo: {
    type: String,
    required: [true, "Phone number is required"],
    validate: {
      validator: (v) => /^[0-9]{10}$/.test(v),
      message: "Phone number must be 10 digits",
    },
    minLength: [10, "Phone number must be 10 digits"],
    maxLength: [10, "Phone number must be 10 digits"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: "Invalid email format",
    },
  },
  appointmentType: {
    type: String,
    required: [true, "Appointment type is required"],
    enum: {
      values: ["veterinarian", "groomer", "trainer"],
      message: "Appointment type must be veterinarian, groomer, or trainer",
    },
  },
  appointmentFee: {
    type: Number,
    required: [true, "Appointment fee is required"],
    min: [0, "Appointment fee must be greater than or equal to 0"],
    validate: {
      validator: (v) => !isNaN(v) && v > 0,
      message: "Appointment fee must be a positive number",
    },
  },
  status: {
    type: String,
    default: "scheduled",
    enum: {
      values: ["scheduled", "completed", "cancelled", "missed"],
      message: "Status must be scheduled, completed, cancelled, or missed",
    },
  },
  paymentStatus: {
    type: String,
    default: "pending",
    enum: {
      values: ["pending", "paid", "failed"],
      message: "Payment status must be pending, paid, or failed",
    },
  },
  paymentIntentId: {
    type: String,
    sparse: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: "cancelled" } } }
);

export default mongoose.model("Appointment", appointmentSchema);