import AdoptedPet from "../models/AdoptedPet.js";
import AdoptablePet from "../models/AdoptablePet.js";

// Create Adopted Pet
export const createAdoptedPet = async (req, res) => {
  try {
    const pet = new AdoptedPet(req.body);
    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Adopted Pets
export const getAllAdoptedPets = async (req, res) => {
  try {
    const pets = await AdoptedPet.find();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Adopted Pet
export const updateAdoptedPet = async (req, res) => {
  try {
    const pet = await AdoptedPet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Adopted Pet
export const deleteAdoptedPet = async (req, res) => {
  try {
    await AdoptedPet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Adopted Pet deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Move pet from AdoptablePet to AdoptedPet
export const moveToAdoptedPet = async (req, res) => {
  try {
    const pet = await AdoptablePet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    const adoptedPet = new AdoptedPet(pet.toObject());
    await adoptedPet.save();
    await AdoptablePet.findByIdAndDelete(req.params.id);
    res.status(201).json(adoptedPet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 