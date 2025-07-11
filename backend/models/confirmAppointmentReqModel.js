import mongoose from 'mongoose';

const confirmAppointmentReqSchema = new mongoose.Schema({
  doctorId: {
    type: String,
    required: true
  },
  professionalType: {
    type: String,
    enum: ['vet', 'groomer', 'pet-trainer'],
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  chargePerAppointment: {
    type: Number,
    required: true,
    min: 0
  },
  specialNotes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['confirmed', 'pending'], // Add status if needed
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ConfirmAppointmentReq', confirmAppointmentReqSchema);