import jwt from "jsonwebtoken";
import Professional from "../models/professionalModel.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import rateLimit from 'express-rate-limit';


export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true,
});

// Login controller
export const profLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email });

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
 HAMZA    }

    // Find professional by email only
    const professional = await Professional.findOne({ pemail: email });
    console.log('Found professional:', professional);

    if (!professional) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await professional.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT with id, pID, and role
    const token = jwt.sign(
      {
        id: professional._id,
        pID: professional.pID,
        role: professional.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      professional: professional.toJSON(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateToken = (id) => {
  return jwt.sign({ id, role: "professional" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerProfessional = async (req, res) => {
  const { pName, role, pID, pemail, ppassword, pphoneNumber, qualification, experience, description } = req.body;

  try {
    console.log("Received registration request with data:", {
      pName,
      role,
      pID,
      pemail,
      pphoneNumber,
      qualification,
      experience,
      description,
      hasFile: !!req.file
    });

    // Check if professional already exists
    const professionalExists = await Professional.findOne({ $or: [{ pemail }, { pID }] });
    if (professionalExists) {
      return res.status(400).json({
        message: professionalExists.pemail === pemail ? "Email already exists" : "Professional ID already exists",
      });
    }

    // Handle profile picture upload to Cloudinary
    let profilePicture = "";
    if (req.file) {
      console.log("Processing file upload:", req.file);
      try {
        // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "professionals",
        use_filename: true,
          resource_type: "auto"
      });
        
        if (!result || !result.secure_url) {
          throw new Error("Failed to get secure URL from Cloudinary");
        }
        
      profilePicture = result.secure_url;
        console.log("File uploaded successfully to Cloudinary:", profilePicture);

        // Clean up the temporary file
        try {
          fs.unlinkSync(req.file.path);
          console.log("Temporary file deleted successfully");
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
          message: "Error uploading profile picture",
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }

    // Create new professional
    const professional = new Professional({
      pName,
      role,
      pID,
      pemail,
      ppassword,
      pphoneNumber: pphoneNumber || undefined,
      qualification,
      experience,
      description: description || undefined,
      profilePicture,
    });

    // Save professional (password hashed by pre-save hook)
    await professional.save();
    console.log("Professional saved successfully");

    res.status(201).json({
      message: "Professional registered successfully.",
      professional: {
        _id: professional._id,
        pName: professional.pName,
        pemail: professional.pemail,
        role: professional.role,
        pID: professional.pID,
        profilePicture: professional.profilePicture,
      },
    });
  } catch (error) {
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: error.message || "Server error during registration",
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const loginProfessional = async (req, res) => {
  const { pemail, ppassword } = req.body;

  try {
    const professional = await Professional.findOne({ pemail });
    if (!professional) {
      console.log("Professional not found for email:", pemail);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await professional.comparePassword(ppassword);
    console.log("Password match result:", isMatch);
    console.log("Stored password hash:", professional.ppassword);
    if (!isMatch) {
      console.log("Password mismatch for professional:", professional.pemail);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(professional._id);

    res.status(200).json({
      token,
      _id: professional._id,
      name: professional.pName,
      email: professional.pemail,
      role: professional.role,
    });
  } catch (error) {
    console.error("Login error details:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const professional = await Professional.findById(req.admin.id).select("-ppassword");
    if (!professional) {
      return res.status(404).json({ message: "Professional not found" });
    }
    res.json(professional);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllProfessionals = async (req, res) => {
  try {
    const professionals = await Professional.find().select("-ppassword");
    res.status(200).json(professionals);
  } catch (error) {
    console.error("Error fetching professionals:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteProfileById = async (req, res) => {
  try {
    const professionalId = req.params.id;
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: "Professional not found" });
    }

    await Professional.findByIdAndDelete(professionalId);
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfessional = async (req, res) => {
  try {
    const professionalId = req.params.id;
    const { pName, pemail, pphoneNumber, qualification, experience, description, role } = req.body;

    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: "Professional not found" });
    }

    // Check if email is being changed and if it's already taken
    if (pemail !== professional.pemail) {
      const existingProfessional = await Professional.findOne({ pemail });
      if (existingProfessional) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    // Update professional fields
    professional.pName = pName || professional.pName;
    professional.pemail = pemail || professional.pemail;
    professional.pphoneNumber = pphoneNumber || professional.pphoneNumber;
    professional.qualification = qualification || professional.qualification;
    professional.experience = experience || professional.experience;
    professional.description = description || professional.description;
    professional.role = role || professional.role;

    // Handle profile picture upload
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "professionals",
          use_filename: true,
          resource_type: "auto"
        });
        
        if (!result || !result.secure_url) {
          throw new Error("Failed to get secure URL from Cloudinary");
        }
        
        professional.profilePicture = result.secure_url;

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
          message: "Error uploading profile picture",
          error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    }

    await professional.save();
    res.status(200).json({ 
      message: "Profile updated successfully", 
      professional: {
        _id: professional._id,
        pName: professional.pName,
        pemail: professional.pemail,
        pphoneNumber: professional.pphoneNumber,
        qualification: professional.qualification,
        experience: professional.experience,
        description: professional.description,
        role: professional.role,
        profilePicture: professional.profilePicture
      }
    });
  } catch (error) {
    console.error("Error updating professional:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getProfessionalById = async (req, res) => {
  try {
    const professionalId = req.params.id;
    const professional = await Professional.findById(professionalId).select("-ppassword");
    if (!professional) {
      return res.status(404).json({ message: "Professional not found" });
    }
    res.json(professional);
  } catch (error) {
    console.error("Error fetching professional:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};