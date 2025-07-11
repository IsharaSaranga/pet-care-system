import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Pet from '../models/Pet.js'; // Import Pet model for cascading deletion
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @route   POST /api/users/register
// @desc    Register a new user
export const registerUser = async (req, res) => {
  const { name, email, phoneNumber, city, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // Handle profile picture upload to Cloudinary
    let profilePicture = "";
    if (req.file) {
      try {
        console.log("Uploading file to Cloudinary:", req.file);
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "users",
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

    // Create new user
    const newUser = new User({
      name,
      email,
      phoneNumber,
      city,
      password,
      profilePicture
    });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        city: newUser.city,
        profilePicture: newUser.profilePicture,
        token: generateToken(newUser),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

// @route   POST /api/users/login
// @desc    Authenticate user & get token
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        city: user.city,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// @route   GET /api/users/profile
// @desc    Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// @route   PUT /api/users/profile
// @desc    Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phoneNumber, city } = req.body;
    
    // Find the user first
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    user.city = city || user.city;

    // Handle profile picture upload to Cloudinary
    if (req.file) {
      try {
        console.log("Uploading file to Cloudinary:", req.file);
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "users",
          use_filename: true,
          resource_type: "auto"
        });
        
        if (!result || !result.secure_url) {
          throw new Error("Failed to get secure URL from Cloudinary");
        }
        
        user.profilePicture = result.secure_url;
        console.log("File uploaded successfully to Cloudinary:", user.profilePicture);

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


    // Save the updated user
    await user.save();

    // Generate new token with the same structure as the original token
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        city: user.city,
        profilePicture: user.profilePicture
      },
      token
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// @route   DELETE /api/users/profile
// @desc    Delete user profile
export const deleteProfile = async (req, res) => {
  const userId = req.user.userId; // Consistent with generateToken

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete associated pets (cascading deletion)
    await Pet.deleteMany({ userId });

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Profile and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile', error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the user first to check if they exist
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete associated pets (cascading deletion)
    await Pet.deleteMany({ userId: id });

    // Delete the user
    await User.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};