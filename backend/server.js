import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';


import userRoutes from "./routes/userRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import profRoutes from './routes/profRoutes.js'; // Professional auth routes
import adminRoutes from "./routes/adminRoutes.js";

import appointmentRoutes from './routes/appointmentRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";
import adoptablePetRoutes from './routes/adoptablePetRoutes.js';
import adoptionFormRoutes from './routes/adoptionFormRoutes.js';
import forAdoptionRoutes from './routes/forAdoptionRoutes.js';
import passDataAdoptablePetTable from './routes/passDataAdoptablePetTable.js';
import eventRoutes from "./routes/eventRoutes.js"; // Import event routes
import registrationRoutes from "./routes/registrationRoutes.js";
import professionalAppointmentRoutes from './routes/appointmentRoutes.js';
import lostAndFoundRoutes from './routes/lostAndFoundRoutes.js';
import homeVisitRoutes from './routes/homeVisitRoutes.js';
import adoptedPetRoutes from './routes/adoptedPetRoutes.js';
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import petStoreReviewRouter from "./routes/petStoreReviewRoute.js";
import reportRoutes from "./routes/reportRoutes.js"; // Add this line


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests
app.use('/uploads', express.static('uploads'));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


// Routes
app.use("/api/users", userRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/admins", adminRoutes);


app.use('/api/appointments', appointmentRoutes); // User appointments
app.use('/api/professional-appointments', professionalAppointmentRoutes); // Professional appointments
app.use('/api/professionals', profRoutes); // Professional auth routes

 // Add the admin routes here
app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports",reportRoutes);

// Adoption routes
app.use('/api/adoptablepets', adoptablePetRoutes);
app.use('/api/adoptionform', adoptionFormRoutes);
app.use('/api/foradoption', forAdoptionRoutes);
app.use('/api', passDataAdoptablePetTable);
app.use('/api/homevisits', homeVisitRoutes);
app.use('/api/adoptedpets', adoptedPetRoutes);

// Lost and Found routes
app.use('/api/lost-and-found', lostAndFoundRoutes);

//api endpoints for marketplace
app.use('/api/product',productRouter)
app.use('/api/cart', cartRouter);
app.use('/api/order',orderRouter)
app.use('/api/petStoreReviews', petStoreReviewRouter);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET);
