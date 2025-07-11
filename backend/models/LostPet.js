import mongoose from 'mongoose';

const lostPetSchema = new mongoose.Schema({
  petName: {
    type: String,
    required: true
  },
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
  age: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  lastSeenDate: {
    type: Date,
    required: true
  },
  lastSeenLocation: {
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
    enum: ['lost', 'found'],
    default: 'lost'
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

export default mongoose.model('LostPet', lostPetSchema); 