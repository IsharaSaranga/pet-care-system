import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js"; // Import Admin model

const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token

    // Attach the decoded admin data to the request object
    req.adminId = decoded.adminId;
    req.role = decoded.role;

    // Optional: You can fetch additional admin data here if necessary
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default adminAuth;
