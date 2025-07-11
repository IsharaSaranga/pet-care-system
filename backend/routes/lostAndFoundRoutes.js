import express from 'express';
import { createLostPet, getAllLostPets, getUserLostPets, getLostPet, updateLostPet, deleteLostPet } from '../controllers/lostPetController.js';
import { createFoundPet, getAllFoundPets, getUserFoundPets, getFoundPet, updateFoundPet, deleteFoundPet } from '../controllers/foundPetController.js';
import auth from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'));
    }
  }
});

// Lost Pet Routes
router.post('/lost', auth, upload.single('image'), createLostPet);
router.get('/lost', getAllLostPets);
router.get('/lost/user', auth, getUserLostPets);
router.get('/lost/:id', getLostPet);
router.put('/lost/:id', auth, upload.single('image'), updateLostPet);
router.delete('/lost/:id', auth, deleteLostPet);

// Found Pet Routes
router.post('/found', auth, upload.single('image'), createFoundPet);
router.get('/found', getAllFoundPets);
router.get('/found/user', auth, getUserFoundPets);
router.get('/found/:id', getFoundPet);
router.put('/found/:id', auth, upload.single('image'), updateFoundPet);
router.delete('/found/:id', auth, deleteFoundPet);

export default router; 