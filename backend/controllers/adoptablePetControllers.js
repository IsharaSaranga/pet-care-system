import AdoptablePet from "../models/AdoptablePet.js";

// Create Adoptable Pet
export const createAdoptablePet = async (req, res) => {
  try {
    const { Pet_Name, Breed, Species, Gender, Age, Pet_Description } = req.body;
    const Pet_Image = req.file ? `/uploads/${req.file.filename}` : null;

    const pet = new AdoptablePet({ Pet_Name, Breed, Species, Gender, Age, Pet_Description, Pet_Image });
    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Adoptable Pets
export const getAllAdoptablePets = async (req, res) => {
  try {
    const pets = await AdoptablePet.find();
    res.status(200).json(pets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Adoptable Pet
export const updateAdoptablePet = async (req, res) => {
  try {
    const pet = await AdoptablePet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(pet);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Adoptable Pet
export const deleteAdoptablePet = async (req, res) => {
  try {
    await AdoptablePet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Adoptable Pet deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
