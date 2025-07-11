import FoundPet from '../models/FoundPet.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new found pet
export const createFoundPet = async (req, res) => {
  try {
    const { petType, breed, color, gender, foundDate, foundLocation, description, contactNumber, email } = req.body;
    
    // Handle image upload
    const image = req.file ? req.file.filename : null;
    
    const foundPet = new FoundPet({
      petType,
      breed,
      color,
      gender,
      foundDate,
      foundLocation,
      description,
      contactNumber,
      email,
      image,
      userId: req.user.userId
    });

    await foundPet.save();
    res.status(201).json({ message: 'Found pet report created successfully', foundPet });
  } catch (error) {
    res.status(500).json({ message: 'Error creating found pet report', error: error.message });
  }
};

// Get all found pets
export const getAllFoundPets = async (req, res) => {
  try {
    const foundPets = await FoundPet.find().populate('userId', 'name email');
    res.status(200).json(foundPets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching found pets', error: error.message });
  }
};

// Get found pets by user
export const getUserFoundPets = async (req, res) => {
  try {
    const foundPets = await FoundPet.find({ userId: req.user.userId });
    res.status(200).json(foundPets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user found pets', error: error.message });
  }
};

// Get single found pet
export const getFoundPet = async (req, res) => {
  try {
    const foundPet = await FoundPet.findById(req.params.id).populate('userId', 'name email');
    if (!foundPet) {
      return res.status(404).json({ message: 'Found pet not found' });
    }
    res.status(200).json(foundPet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching found pet', error: error.message });
  }
};

// Update found pet
export const updateFoundPet = async (req, res) => {
  try {
    const { petType, breed, color, gender, foundDate, foundLocation, description, contactNumber, email } = req.body;
    
    const foundPet = await FoundPet.findById(req.params.id);
    if (!foundPet) {
      return res.status(404).json({ message: 'Found pet not found' });
    }

    // Check if user is authorized
    if (foundPet.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this pet' });
    }

    // Handle image update
    let image = foundPet.image;
    if (req.file) {
      // Delete old image if exists
      if (foundPet.image) {
        const oldImagePath = path.join(__dirname, '../uploads', foundPet.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image = req.file.filename;
    }

    const updatedFoundPet = await FoundPet.findByIdAndUpdate(
      req.params.id,
      {
        petType,
        breed,
        color,
        gender,
        foundDate,
        foundLocation,
        description,
        contactNumber,
        email,
        image
      },
      { new: true }
    );

    res.status(200).json({ message: 'Found pet updated successfully', foundPet: updatedFoundPet });
  } catch (error) {
    res.status(500).json({ message: 'Error updating found pet', error: error.message });
  }
};

// Delete found pet
export const deleteFoundPet = async (req, res) => {
  try {
    const foundPet = await FoundPet.findById(req.params.id);
    if (!foundPet) {
      return res.status(404).json({ message: 'Found pet not found' });
    }

    // Check if user is authorized
    if (!req.user.userId && !req.user.adminId) {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }
    if (req.user.userId && foundPet.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }

    // Delete image if exists
    if (foundPet.image) {
      const imagePath = path.join(__dirname, '../uploads', foundPet.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await FoundPet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Found pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting found pet', error: error.message });
  }
}; 