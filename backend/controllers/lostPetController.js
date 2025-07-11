import LostPet from '../models/LostPet.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new lost pet
export const createLostPet = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { petName, petType, breed, color, age, gender, lastSeenDate, lastSeenLocation, description, contactNumber, email } = req.body;
    
    // Validate required fields
    if (!petName || !petType || !breed || !color || !age || !gender || !lastSeenDate || !lastSeenLocation || !description || !contactNumber || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Handle image upload
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    const image = req.file.filename;
    
    const lostPet = new LostPet({
      petName,
      petType,
      breed,
      color,
      age,
      gender,
      lastSeenDate,
      lastSeenLocation,
      description,
      contactNumber,
      email,
      image,
      userId: req.user.userId
    });

    await lostPet.save();
    res.status(201).json({ message: 'Lost pet report created successfully', lostPet });
  } catch (error) {
    console.error('Error in createLostPet:', error);
    // If there's a file upload error, delete the uploaded file
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ 
      message: 'Error creating lost pet report', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all lost pets
export const getAllLostPets = async (req, res) => {
  try {
    const lostPets = await LostPet.find().populate('userId', 'name email');
    res.status(200).json(lostPets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lost pets', error: error.message });
  }
};

// Get lost pets by user
export const getUserLostPets = async (req, res) => {
  try {
    const lostPets = await LostPet.find({ userId: req.user.userId });
    res.status(200).json(lostPets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user lost pets', error: error.message });
  }
};

// Get single lost pet
export const getLostPet = async (req, res) => {
  try {
    const lostPet = await LostPet.findById(req.params.id).populate('userId', 'name email');
    if (!lostPet) {
      return res.status(404).json({ message: 'Lost pet not found' });
    }
    res.status(200).json(lostPet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lost pet', error: error.message });
  }
};

// Update lost pet
export const updateLostPet = async (req, res) => {
  try {
    const { petName, petType, breed, color, age, gender, lastSeenDate, lastSeenLocation, description, contactNumber, email } = req.body;
    
    const lostPet = await LostPet.findById(req.params.id);
    if (!lostPet) {
      return res.status(404).json({ message: 'Lost pet not found' });
    }

    // Check if user is authorized
    if (lostPet.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this pet' });
    }

    // Handle image update
    let image = lostPet.image;
    if (req.file) {
      // Delete old image if exists
      if (lostPet.image) {
        const oldImagePath = path.join(__dirname, '../uploads', lostPet.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image = req.file.filename;
    }

    const updatedLostPet = await LostPet.findByIdAndUpdate(
      req.params.id,
      {
        petName,
        petType,
        breed,
        color,
        age,
        gender,
        lastSeenDate,
        lastSeenLocation,
        description,
        contactNumber,
        email,
        image
      },
      { new: true }
    );

    res.status(200).json({ message: 'Lost pet updated successfully', lostPet: updatedLostPet });
  } catch (error) {
    res.status(500).json({ message: 'Error updating lost pet', error: error.message });
  }
};

// Delete lost pet
export const deleteLostPet = async (req, res) => {
  try {
    const lostPet = await LostPet.findById(req.params.id);
    if (!lostPet) {
      return res.status(404).json({ message: 'Lost pet not found' });
    }

    // Check if user is authorized
    if (!req.user.userId && !req.user.adminId) {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }
    if (req.user.userId && lostPet.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }

    // Delete image if exists
    if (lostPet.image) {
      const imagePath = path.join(__dirname, '../uploads', lostPet.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await LostPet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Lost pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lost pet', error: error.message });
  }
}; 