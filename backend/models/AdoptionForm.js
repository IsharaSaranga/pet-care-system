import mongoose from 'mongoose';

const adoptionFormSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    petType: { type: String, required: true },
    petName: { type: String, required: true },
    petImage: { type: String },
    homeType: { type: String, required: true },
    employmentStatus: { type: String, required: true },
    hasYard: { type: Boolean, required: true },
    hasOtherPets: { type: Boolean, required: true },
    additionalInfo: { type: String },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

const AdoptionForm = mongoose.model('adoptionForm', adoptionFormSchema);
export default AdoptionForm;
