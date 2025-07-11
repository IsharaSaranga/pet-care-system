import express from "express";
import multer from "multer";
import {
  addPet,
  getAllAdoptionListings, 
  getAdoptionListingById, 
  getAdoptionListingsByOwner,
  updateAdoptionListing, 
  deleteAdoptionListing 
} from "../controllers/forAdoptionControllers.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("petImage"), addPet); // Accept image upload

// Get all adoption listings
router.get('/', getAllAdoptionListings);

// Get adoption listings by owner's userId
router.get('/owner/:userId', getAdoptionListingsByOwner);

// Get specific adoption listing by ID
router.get('/:id', getAdoptionListingById);

// Update adoption listing
router.put('/:id', upload.single('petImage'), updateAdoptionListing);

// Delete adoption listing
router.delete('/:id', deleteAdoptionListing);


export default router;
