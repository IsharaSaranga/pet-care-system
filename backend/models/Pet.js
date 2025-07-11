import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: ['Medical', 'Grooming', 'Training', 'vaccination']
  },
  date: { type: Date, required: true },
  diagnosis: { type: String, required: function() { return this.type === 'Medical'; } },
  treatment: { type: String, required: function() { return this.type === 'Medical'; } },
  groomingService: { type: String, required: function() { return this.type === 'Grooming'; } },
  groomerNotes: { type: String, required: function() { return this.type === 'Grooming'; } },
  trainingFocus: { type: String, required: function() { return this.type === 'Training'; } },
  trainerNotes: { type: String, required: function() { return this.type === 'Training'; } },
  description: { type: String, required: function() { return this.type === 'vaccination'; } },
  doctorId: { type: String, required: function() { return this.type === 'vaccination'; } }
});

const petSchema = new mongoose.Schema({
  petId: { 
    type: String, 
    required: true, 
    unique: true // Add petId for searching
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true, 
    ref: 'User',
    index: true // Add index for better query performance, but not unique
  },
  name: { 
    type: String, 
    required: true 
  },
  gender: { 
    type: String, 
    required: true 
  },
  breed: { 
    type: String, 
    required: true 
  },
  petBYear: { 
    type: Number, 
    required: true 
  },
  petimage: { 
    type: String, 
    default: 'https://via.placeholder.com/150' // Default placeholder image
  },
  specialNotes: { 
    type: String 
  },
  medicalRecords: [medicalReportSchema],
});

export default mongoose.model('Pet', petSchema);