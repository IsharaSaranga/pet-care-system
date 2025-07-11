import express from "express";
import { registerUser, loginUser, getUserProfile, updateProfile , deleteProfile, getAllUsers,deleteProfileById } from "../controllers/userController.js";
import auth from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images (jpeg, jpg, png) are allowed"));
  },
});

const router = express.Router();

router.post("/register", upload.single("profilePicture"), registerUser);
router.post("/login", loginUser);
router.get("/profile", auth, getUserProfile);
router.put("/updateProfile", auth, upload.single("profilePicture"), updateProfile);
router.post("/deleteProfile", auth, deleteProfile);
router.get('/all', auth, getAllUsers);
router.post('/deleteProfile/:id', auth, deleteProfileById);

export default router;