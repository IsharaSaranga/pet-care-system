import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
  },
  userId: {
    type: String, // Matches your sample data
    required: true,
  },
  requestDate: {
    type: Date,
    default: Date.now,
  },
  processedDate: Date,
  amount: {
    type: Number,
    required: true,
  },
  processingFee: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending',
  },
  reason: {
    type: String,
    required: true,
  },
  adminNotes: String,
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'bank_transfer'],
    required: false, // Optional since missing in your data
    default: 'unknown',
  },
  transactionId: String,
  metadata: {
    type: {
      cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      cancellationDate: {
        type: Date,
        default: Date.now,
      },
    },
    default: {},
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
});

export default mongoose.model('RefundRequest', refundRequestSchema);