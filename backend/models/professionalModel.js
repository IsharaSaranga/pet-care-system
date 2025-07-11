import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const professionalSchema = new mongoose.Schema({
  pName: {
    type: String,
    required: [true, 'Professional name is required'],
    trim: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['groomer', 'vet', 'pet-trainer'], // Changed "veterinarian" to "vet"
    default: 'groomer',
    lowercase: true,
  },
  pID: {
    type: String,
    required: true,
    unique: true,
  },
  pemail: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: (props) => `${props.value} is not a valid email!`,
    },
  },
  ppassword: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  pphoneNumber: {
    type: String,
    validate: {
      validator: (v) => /^[0-9]{10,15}$/.test(v),
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required'],
  },
  experience: {
    type: String,
    required: [true, 'Experience is required'],
  },
  description: {
    type: String,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.ppassword;
      delete ret.__v;
      return ret;
    },
  },
});

// Hash password before saving
professionalSchema.pre('save', async function (next) {
  if (!this.isModified('ppassword')) {
    console.log('Password not modified, skipping hash');
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.ppassword = await bcrypt.hash(this.ppassword, salt);
    console.log('Password hashed successfully:', this.ppassword);
    next();
  } catch (err) {
    console.error('Error hashing password:', err);
    next(err);
  }
});

// Method to compare passwords
professionalSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.ppassword);
};

const Professional = mongoose.model('Professional', professionalSchema);
export default Professional;