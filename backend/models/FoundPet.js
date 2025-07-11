import mongoose from 'mongoose';

const foundPetSchema = new mongoose.Schema({
  petType: {
    type: String,
    required: true
  },
  breed: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  foundDate: {
    type: Date,
    required: true
  },
  foundLocation: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['found', 'claimed'],
    default: 'found'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('FoundPet', foundPetSchema); 