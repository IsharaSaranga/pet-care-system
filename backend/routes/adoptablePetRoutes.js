import express from "express";
import multer from "multer";
import {
  createAdoptablePet,
  getAllAdoptablePets,
  updateAdoptablePet,
  deleteAdoptablePet
} from "../controllers/adoptablePetControllers.js"

const router = express.Router();

// Image Storage
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Routes
router.post("/", upload.single("Pet_Image"), createAdoptablePet);
router.get("/", getAllAdoptablePets);
router.put("/:id", updateAdoptablePet);
router.delete("/:id", deleteAdoptablePet);

export default router;
