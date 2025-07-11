import ForAdoption from "../models/ForAdoption.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
export const upload = multer({ storage }); // Export the upload instance

// Add a pet for adoption (with image)
export const addPet = async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        console.log('Received file:', req.file);

        const {
            userId,
            ownerFirstName,
            ownerLastName,
            email,
            phone,
            petName,
            petAge,
            petGender,
            petBreed,
            petSpecies,
            petDescription,
            reason,
            specialNeeds,
            vaccinated,
            neutered
        } = req.body;

        console.log('Adding pet with data:', {
            userId,
            ownerName: `${ownerFirstName} ${ownerLastName}`,
            email,
            phone,
            petName,
            specialNeeds,
            vaccinated,
            neutered
        });

        const newPet = new ForAdoption({
            userId,
            ownerFirstName,
            ownerLastName,
            email,
            phone,
            petName,
            petAge,
            petGender,
            petBreed,
            petSpecies,
            petDescription,
            reason,
            specialNeeds,
            vaccinated,
            neutered,
            petImage: req.file ? `/uploads/${req.file.filename}` : null,
        });

        console.log('Created new pet object:', newPet);

        await newPet.save();
        console.log('Saved pet:', {
            _id: newPet._id,
            userId: newPet.userId,
            ownerName: `${newPet.ownerFirstName} ${newPet.ownerLastName}`,
            email: newPet.email,
            petName: newPet.petName
        });
        res.status(201).json({ message: "Pet added for adoption successfully", newPet });
    } catch (error) {
        console.error('Error adding pet:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all adoption listings
export const getAllAdoptionListings = async (req, res) => {
    try {
        const userId = req.query.userId;
        const query = userId ? { userId } : {};
        const listings = await ForAdoption.find(query);
        res.status(200).json(listings);
    } catch (error) {
        console.error('Error fetching adoption listings:', error);
        res.status(500).json({ message: 'Failed to fetch adoption listings', error: error.message });
    }
};

// Get a single adoption listing by ID
export const getAdoptionListingById = async (req, res) => {
    try {
        const listing = await ForAdoption.findById(req.params.id);
        if (!listing) {
            return res.status(404).json({ message: 'Adoption listing not found' });
        }
        res.status(200).json(listing);
    } catch (error) {
        console.error('Error fetching adoption listing:', error);
        res.status(500).json({ message: 'Failed to fetch adoption listing', error: error.message });
    }
};

// Get adoption listings by owner
export const getAdoptionListingsByOwner = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log('Fetching pets for userId:', userId);
        
        // First, let's see all pets in the database
        const allPets = await ForAdoption.find({});
        console.log('All pets in database:', allPets.map(pet => ({ 
            _id: pet._id, 
            userId: pet.userId, 
            ownerName: `${pet.ownerFirstName} ${pet.ownerLastName}`,
            email: pet.email 
        })));
        
        // Now let's find pets for this specific user
        const listings = await ForAdoption.find({ userId: userId });
        console.log('Found listings for user:', listings.map(pet => ({ 
            _id: pet._id, 
            userId: pet.userId, 
            ownerName: `${pet.ownerFirstName} ${pet.ownerLastName}`,
            email: pet.email 
        })));
        
        res.status(200).json(listings);
    } catch (error) {
        console.error('Error fetching owner adoption listings:', error);
        res.status(500).json({ message: 'Failed to fetch owner adoption listings', error: error.message });
    }
};

// Update adoption listing
export const updateAdoptionListing = async (req, res) => {
    try {
        const listingId = req.params.id;
        const listing = await ForAdoption.findById(listingId);
        
        if (!listing) {
            return res.status(404).json({ message: 'Adoption listing not found' });
        }
        
        // Only allow updating pet-related fields
        const allowedFields = [
            'petName',
            'petAge',
            'petGender',
            'petBreed',
            'petSpecies',
            'petDescription',
            'reason',
            'specialNeeds',
            'vaccinated',
            'neutered',
            'petImage'
        ];
        
        // Filter out any fields that are not in allowedFields
        const updatedData = {};
        for (const field of allowedFields) {
            if (field in req.body) {
                updatedData[field] = req.body[field];
            }
        }
        
        // Convert string boolean values to actual booleans
        ['specialNeeds', 'vaccinated', 'neutered'].forEach(field => {
            if (field in updatedData) {
                updatedData[field] = updatedData[field] === 'true';
            }
        });
        
        // Handle image upload if a new image is provided
        if (req.file) {
            // Delete old image if it exists
            if (listing.petImage) {
                const oldImagePath = path.join(__dirname, '..', listing.petImage);
                try {
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (err) {
                    console.error('Error deleting old image:', err);
                }
            }
            // Update with new image path
            updatedData.petImage = `/uploads/${req.file.filename}`;
        }
        
        const updatedListing = await ForAdoption.findByIdAndUpdate(
            listingId,
            { $set: updatedData },
            { new: true }
        );
        
        res.status(200).json(updatedListing);
    } catch (error) {
        console.error('Error updating adoption listing:', error);
        res.status(500).json({ message: 'Failed to update adoption listing', error: error.message });
    }
};

// Delete adoption listing
export const deleteAdoptionListing = async (req, res) => {
    try {
        const listingId = req.params.id;
        const listing = await ForAdoption.findById(listingId);
        
        if (!listing) {
            return res.status(404).json({ message: 'Adoption listing not found' });
        }
        
        // Delete associated image if it exists
        if (listing.petImage) {
            const imagePath = path.join(__dirname, '..', listing.petImage);
            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (err) {
                console.error('Error deleting image file:', err);
                // Continue with deletion even if image deletion fails
            }
        }
        
        await ForAdoption.findByIdAndDelete(listingId);
        res.status(200).json({ message: 'Adoption listing deleted successfully' });
    } catch (error) {
        console.error('Error deleting adoption listing:', error);
        res.status(500).json({ message: 'Failed to delete adoption listing', error: error.message });
    }
};