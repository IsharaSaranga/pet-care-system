import express from "express";
import {
  createAdoptedPet,
  getAllAdoptedPets,
  updateAdoptedPet,
  deleteAdoptedPet,
  moveToAdoptedPet
} from "../controllers/adoptedPetControllers.js";

const router = express.Router();

// CRUD routes
router.post("/", createAdoptedPet);
router.get("/", getAllAdoptedPets);
router.put("/:id", updateAdoptedPet);
router.delete("/:id", deleteAdoptedPet);

// Move from AdoptablePet to AdoptedPet
router.post("/move/:id", moveToAdoptedPet);

export default router; 