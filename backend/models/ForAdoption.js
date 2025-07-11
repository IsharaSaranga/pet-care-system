import mongoose from "mongoose";

const ForAdoptionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    ownerFirstName: { type: String, required: true },
    ownerLastName: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    petName: { type: String, required: true },
    petAge: { type: String, required: true },
    petGender: { type: String, required: true },
    petBreed: { type: String, required: true },
    petSpecies: { type: String, required: true },
    petDescription: { type: String, required: true },
    reason: { type: String, required: true },
    specialNeeds: { type: Boolean, default: false },
    vaccinated: { type: Boolean, default: false },
    neutered: { type: Boolean, default: false },
    petImage: { type: String }, // Image path
}, { timestamps: true });

const ForAdoption = mongoose.model("ForAdoption", ForAdoptionSchema);
export default ForAdoption;
