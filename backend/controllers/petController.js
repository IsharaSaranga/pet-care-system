import Pet from '../models/Pet.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const registerPet = async (req, res) => {
  try {
    const { name, gender, breed, petBYear, vaccinations, specialNotes } = req.body;
    const userId = req.user.userId; // Extracted from JWT token in middleware

    // Handle pet image upload to Cloudinary
    let petimage = "";
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "pets",
          use_filename: true,
          resource_type: "auto"
        });
        
        if (!result || !result.secure_url) {
          throw new Error("Failed to get secure URL from Cloudinary");
        }
        
        petimage = result.secure_url;

        // Clean up the temporary file
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting temporary file:", unlinkError);
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Clean up the temporary file even if upload fails
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting temporary file after failed upload:", unlinkError);
        }
        return res.status(500).json({ 
          message: "Error uploading pet image",
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }

    // Generate a unique petId
    const petId = `PET${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const pet = new Pet({
      petId,
      userId,
      name,
      gender,
      breed,
      petBYear,
      vaccinations,
      specialNotes,
      petimage
    });

    await pet.save();
    res.status(201).json({ message: 'Pet registered successfully', pet });
  } catch (error) {
    console.error('Pet registration error:', error);
    res.status(500).json({ 
      message: 'Error registering pet', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const getUserPets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pets = await Pet.find({ userId });
    res.status(200).json(pets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ 
      message: 'Error fetching pets', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const getPet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // Check if the pet belongs to the authenticated user
    if (pet.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to access this pet' });
    }

    res.status(200).json(pet);
  } catch (error) {
    console.error('Error fetching pet:', error);
    res.status(500).json({ 
      message: 'Error fetching pet', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const updatePet = async (req, res) => {
  try {
    const { name, gender, breed, petBYear, specialNotes } = req.body;
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if the pet belongs to the authenticated user
    if (pet.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this pet' });
    }

    // Handle pet image upload to Cloudinary if a new image is provided
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "pets",
          use_filename: true,
          resource_type: "auto"
        });
        
        if (!result || !result.secure_url) {
          throw new Error("Failed to get secure URL from Cloudinary");
        }
        
        // Delete old image from Cloudinary if it exists
        if (pet.petimage) {
          const publicId = pet.petimage.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }

        pet.petimage = result.secure_url;

        // Clean up the temporary file
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting temporary file:", unlinkError);
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        // Clean up the temporary file even if upload fails
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error("Error deleting temporary file after failed upload:", unlinkError);
        }
        return res.status(500).json({ 
          message: "Error uploading pet image",
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }

    // Update pet details
    pet.name = name || pet.name;
    pet.gender = gender || pet.gender;
    pet.breed = breed || pet.breed;
    pet.petBYear = petBYear || pet.petBYear;
    pet.specialNotes = specialNotes || pet.specialNotes;

    await pet.save();
    res.status(200).json({ message: 'Pet updated successfully', pet });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ 
      message: 'Error updating pet', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Check if the pet belongs to the authenticated user
    if (pet.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this pet' });
    }

    // Delete pet image from Cloudinary if it exists
    if (pet.petimage) {
      try {
        const publicId = pet.petimage.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
      }
    }

    await Pet.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    res.status(500).json({ 
      message: 'Error deleting pet', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};