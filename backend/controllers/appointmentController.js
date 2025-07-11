import mongoose from 'mongoose'; // Add this line
import Appointment from '../models/Appointment.js';
import Professional from '../models/professionalModel.js';
import RefundRequest from '../models/AppointmentrefundRequestModel.js';
import AppointmentTemp from  '../models/appointmentTempModel.js';
import ConfirmAppointmentReq from '../models/confirmAppointmentReqModel.js';
import ProfessionalNotification from "../models/professional_notification_.js"
import Pet from '../models/Pet.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';
import Stripe from "stripe";
import { sendEmail } from "../utils/email.js";
const stripe = new Stripe("sk_test_51R9BsuQev5RhdlHVtR3ArfZEHEJNPqbRk3d2STp9KuvatV2uq6KjSegkDo0U8mg8RVLi89KtpYEMEQUw7zdXnm8F00msDdVYFS");


export const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate user authentication
    if (!req.user || !req.user.userId) {
      await session.abortTransaction();
      return res.status(401).json({ success: false, message: "User authentication required" });
    }
    const userId = req.user.userId;

    const { doctorId, appointmentDate, appointmentTime, userName, phoneNo, email, appointmentType, appointmentFee } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !appointmentTime || !userName || !phoneNo || !email || !appointmentType || !appointmentFee) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate date
    const parsedDate = new Date(appointmentDate);
    if (isNaN(parsedDate.getTime())) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid date format" });
    }

    // Validate appointment fee
    if (isNaN(appointmentFee) || Number(appointmentFee) <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid appointment fee" });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNo)) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: "Invalid phone number format (must be 10 digits)" });
    }

    // Check for existing appointment
    try {
      const existingAppointment = await Appointment.findOne({
        doctorId,
        appointmentDate: parsedDate,
        appointmentTime,
      }).session(session);

      if (existingAppointment) {
        await session.abortTransaction();
        return res.status(409).json({ success: false, message: "Time slot already booked" });
      }
    } catch (dbError) {
      console.error("Database error while checking existing appointment:", dbError);
      throw new Error(`Database error while checking existing appointment: ${dbError.message}`);
    }

    // Create new appointment
    const newAppointment = new Appointment({
      userId,
      doctorId,
      appointmentDate: parsedDate,
      appointmentTime,
      userName,
      phoneNo,
      email,
      appointmentType,
      appointmentFee,
    });

    // Save the appointment
    try {
      await newAppointment.save({ session });
    } catch (dbError) {
      console.error("Database error while saving appointment:", dbError);
      throw new Error(`Database error while saving appointment: ${dbError.message}`);
    }

    // Create Stripe checkout session
    let checkoutSession;
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${appointmentType.charAt(0).toUpperCase() + appointmentType.slice(1)} Appointment with ${doctorId}`,
                description: `Date: ${parsedDate.toDateString()}, Time: ${appointmentTime}`,
              },
              unit_amount: Math.round(appointmentFee * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}&appointment_id=${newAppointment._id}`,
        cancel_url: `${req.headers.origin}/cancel`,
        metadata: { appointmentId: newAppointment._id.toString() },
      });
    } catch (stripeError) {
      console.error("Stripe error while creating checkout session:", stripeError);
      throw new Error(`Stripe error while creating checkout session: ${stripeError.message}`);
    }

    // Update appointment with payment intent ID
    try {
      newAppointment.paymentIntentId = checkoutSession.payment_intent;
      await newAppointment.save({ session });
    } catch (dbError) {
      console.error("Database error while updating paymentIntentId:", dbError);
      throw new Error(`Database error while updating paymentIntentId: ${dbError.message}`);
    }

    // Commit transaction
    try {
      await session.commitTransaction();
    } catch (txError) {
      console.error("Transaction commit error:", txError);
      throw new Error(`Transaction commit error: ${txError.message}`);
    }

    res.status(200).json({
      success: true,
      message: "Proceed to payment",
      checkoutUrl: checkoutSession.url,
      appointmentId: newAppointment._id,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error creating appointment:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};



export const confirmPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { sessionId, appointmentId } = req.query;
    const userId = req.user.userId;

    console.log("Payment Confirmation Request:", {
      sessionId,
      appointmentId,
      userId
    });

    // Validate inputs
    if (!sessionId || !sessionId.startsWith('cs_')) {
      throw new Error("Invalid Stripe session ID");
    }

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      throw new Error("Invalid appointment ID");
    }

    // Find appointment
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      userId
    }).session(session);

    if (!appointment) {
      throw new Error("Appointment not found or doesn't belong to user");
    }

    // Verify Stripe session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    console.log("Stripe Session Details:", {
      payment_status: checkoutSession.payment_status,
      amount_total: checkoutSession.amount_total,
      metadata: checkoutSession.metadata
    });

    if (checkoutSession.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    // Verify amount matches
    const expectedAmount = Math.round(appointment.appointmentFee * 100);
    if (checkoutSession.amount_total !== expectedAmount) {
      throw new Error("Payment amount mismatch");
    }

    // Update appointment
    appointment.paymentStatus = "paid";
    appointment.paymentDate = new Date();
    appointment.paymentIntentId = checkoutSession.payment_intent.id;
    
    await appointment.save({ session });
    await session.commitTransaction();

    console.log("Payment confirmed successfully for appointment:", appointmentId);
    
    res.status(200).json({ 
      success: true,
      message: "Payment confirmed successfully",
      appointment: {
        id: appointment._id,
        date: appointment.appointmentDate,
        time: appointment.appointmentTime
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Payment Confirmation Error:", {
      message: error.message,
      stack: error.stack
    });

    res.status(400).json({ 
      success: false,
      message: error.message || "Payment confirmation failed",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    session.endSession();
  }
};








export const getActiveAppointments = async (req, res) => {
  try {
    // Step 1: Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "User authentication required" });
    }
    const userId = req.user.userId;

    // Step 2: Fetch active appointments for the logged-in user
    const currentDate = new Date(); // Get today's date
    const activeAppointments = await Appointment.find({
      userId: userId, // Match the authenticated user's ID
      appointmentDate: { $gte: currentDate }, // Only future or today's appointments
    })
      .sort({ appointmentDate: 1, appointmentTime: 1 }) // Sort by date and time ascending
      .exec();

    // Step 3: Check if there are any appointments
    if (!activeAppointments || activeAppointments.length === 0) {
      return res.status(404).json({ success: false, message: "No active appointments found" });
    }

    // Step 4: Return the active appointments
    res.status(200).json({
      success: true,
      message: "Active appointments retrieved successfully",
      appointments: activeAppointments,
    });
  } catch (error) {
    // Step 5: Handle errors
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: "Failed to fetch appointments", error: error.message });
  }
};






















// Regular cancellation
export const cancelAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Check if user is authenticated
    if (!req.user || !req.user.userId) {
      await session.abortTransaction();
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication required' 
      });
    }
    const userId = req.user.userId; // From JWT token

    // Step 2: Get the appointment ID from params
    const { id } = req.params;
    const appointment = await Appointment.findById(id).session(session);

    if (!appointment) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Step 3: Verify the appointment belongs to the user
    if (appointment.userId.toString() !== userId) {
      await session.abortTransaction();
      return res.status(403).json({ 
        success: false, 
        message: 'You can only cancel your own appointments' 
      });
    }

    // Step 4: Check if the appointment can be cancelled
    if (appointment.status !== 'scheduled') {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Cannot cancel appointment with status: ${appointment.status}`
      });
    }

    // Step 5: Cancel the appointment
    appointment.status = 'cancelled';
    await appointment.save({ session });
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        _id: appointment._id,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
        status: appointment.status
      } // Return minimal data
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};



async function sendRefundNotification(userId, refundId) {
  // Implementation options:
  
  // 1. Console log (for development)
  console.log(`Refund notification: User ${userId} for refund ${refundId}`);}










  
  // Cancel appointment with refund
  export const cancelAppointmentWithRefund = async (req, res) => {
    const session = await mongoose.startSession();
  
    try {
      session.startTransaction();
  
      // Check authentication
      if (!req.user || !req.user.userId) {
        await session.abortTransaction();
        return res.status(401).json({
          success: false,
          message: 'User authentication required'
        });
      }
      const userId = req.user.userId;
  
      // Extract and validate input
      const { id } = req.params;
      const { refundReason, paymentMethod = 'credit_card' } = req.body;
  
      console.log('Received paymentMethod:', paymentMethod); // Debug line
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Invalid appointment ID'
        });
      }
  
      if (!refundReason?.trim() || refundReason.trim().length < 10) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Refund reason is required and must be at least 10 characters'
        });
      }
  
      // Find the appointment
      const appointment = await Appointment.findById(id).session(session);
      if (!appointment) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }
  
      // Verify ownership
      if (appointment.userId.toString() !== userId) {
        await session.abortTransaction();
        return res.status(403).json({
          success: false,
          message: 'You can only cancel your own appointments'
        });
      }
  
      // Check for existing refund request
      const existingRefund = await RefundRequest.findOne({ appointmentId: id }).session(session);
      if (existingRefund) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Refund already requested for this appointment'
        });
      }
  
      // Validate appointment status
      if (appointment.status !== 'scheduled') {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Cannot cancel appointment with status: ${appointment.status}`
        });
      }
  
      // Check if appointment is in the past
      const appointmentDateUTC = new Date(appointment.appointmentDate);
      const appointmentTimeUTC = new Date(`1970-01-01T${appointment.appointmentTime}Z`);
      const appointmentDateTime = new Date(
        appointmentDateUTC.getFullYear(),
        appointmentDateUTC.getMonth(),
        appointmentDateUTC.getDate(),
        appointmentTimeUTC.getHours(),
        appointmentTimeUTC.getMinutes()
      );
  
      if (appointmentDateTime < new Date()) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel past appointments'
        });
      }
  
      // Create refund request
      const processingFeePercentage = 0.10;
      const processingFee = parseFloat((appointment.appointmentFee * processingFeePercentage).toFixed(2));
      const netAmount = parseFloat((appointment.appointmentFee - processingFee).toFixed(2));
  
      const paymentMethodValue = paymentMethod || 'credit_card'; // Ensure it’s never undefined
      console.log('Using paymentMethodValue:', paymentMethodValue); // Debug line
  
      const refundRequest = new RefundRequest({
        appointmentId: appointment._id,
        userId: appointment.userId,
        paymentMethod: paymentMethodValue, // Use the forced value
        amount: appointment.appointmentFee,
        processingFee,
        netAmount,
        reason: refundReason,
        status: 'pending',
        metadata: {
          cancelledBy: userId,
          cancellationDate: new Date()
        }
      });
  
      // Save both records
      await refundRequest.save({ session });
      appointment.status = 'cancelled';
      appointment.cancellationReason = refundReason;
      await appointment.save({ session });
  
      // Commit transaction
      await session.commitTransaction();
  
      // Send notification (async)
      sendRefundNotification(appointment.userId, refundRequest._id, netAmount).catch(console.error);
  
      // Send response
      res.status(200).json({
        success: true,
        message: 'Appointment cancelled and refund requested successfully',
        data: {
          refundRequest: {
            id: refundRequest._id,
            amount: refundRequest.amount,
            processingFee: refundRequest.processingFee,
            netAmount: refundRequest.netAmount,
            status: refundRequest.status
          }
        }
      });
  
    } catch (error) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error('[REFUND_ERROR]', {
        error: error.message,
        stack: error.stack,
        time: new Date().toISOString(),
        endpoint: '/cancel-with-refund',
        referenceId: uuidv4()
      });
      res.status(500).json({
        success: false,
        message: 'Failed to process cancellation with refund'
      });
    } finally {
      session.endSession();
    }
  };













export const getVeterinarianAppointments = async (req, res) => {
  console.log('Fetching veterinarian appointments...');
  try {
    // Check if Appointment model is defined
    if (!Appointment) {
      throw new Error('Appointment model not defined');
    }

    const veterinarianAppointments = await Appointment.find({ 
      appointmentType: 'veterinarian', // Changed to 'veterinarian'
      status: 'scheduled'
    })
    .select('userId userName appointmentDate appointmentTime doctorId appointmentFee phoneNo email status')
    .lean();

    console.log('Appointments found:', veterinarianAppointments);
    res.status(200).json(veterinarianAppointments.length ? veterinarianAppointments : []);
  } catch (error) {
    console.error('Error fetching veterinarian appointments:', error);
    res.status(500).json({ 
      message: 'Server error while fetching veterinarian appointments', 
      error: error.message 
    });
  }
};
















export const getGroomerAppointments = async (req, res) => {
  console.log('Fetching groomer appointments...');
  try {
    // Check if Appointment model is defined
    if (!Appointment) {
      throw new Error('Appointment model not defined');
    }

    const groomerAppointments = await Appointment.find({ 
      appointmentType: 'groomer',
      status: 'scheduled'
    })
    .select('userId userName appointmentDate appointmentTime doctorId appointmentFee phoneNo email status') // Added phoneNo, email, status
    .lean();

    console.log('Appointments found:', groomerAppointments);
    res.status(200).json(groomerAppointments.length ? groomerAppointments : []);
  } catch (error) {
    console.error('Error fetching groomer appointments:', error);
    res.status(500).json({ 
      message: 'Server error while fetching groomer appointments', 
      error: error.message 
    });
  }
};








export const getTrainerAppointments = async (req, res) => {
  console.log('Fetching trainer appointments...');
  try {
    // Check if Appointment model is defined
    if (!Appointment) {
      throw new Error('Appointment model not defined');
    }

    const trainerAppointments = await Appointment.find({ 
      appointmentType: 'trainer', // Changed to 'trainer'
      status: 'scheduled'
    })
    .select('userId userName appointmentDate appointmentTime doctorId appointmentFee phoneNo email status')
    .lean();

    console.log('Appointments found:', trainerAppointments);
    res.status(200).json(trainerAppointments.length ? trainerAppointments : []);
  } catch (error) {
    console.error('Error fetching trainer appointments:', error);
    res.status(500).json({ 
      message: 'Server error while fetching trainer appointments', 
      error: error.message 
    });
  }
};











export const getAllCancelledAppointments = async (req, res) => {
  console.log('Fetching all cancelled appointments...');
  try {
    // Check if Appointment model is defined
    if (!Appointment) {
      throw new Error('Appointment model not defined');
    }

    const cancelledAppointments = await Appointment.find({ 
      status: 'cancelled' // Filter by status only, no appointmentType restriction
    })
    .select('userId userName appointmentDate appointmentTime doctorId appointmentFee phoneNo email status')
    .lean();

    console.log('Appointments found:', cancelledAppointments);
    res.status(200).json(cancelledAppointments.length ? cancelledAppointments : []);
  } catch (error) {
    console.error('Error fetching all cancelled appointments:', error);
    res.status(500).json({ 
      message: 'Server error while fetching all cancelled appointments', 
      error: error.message 
    });
  }
};













export const createAvlReqAppointment = async (req, res) => {
  try {
    const {
      professionalId,
      professionalType,
      appointmentDate,
      startTime,
      endTime,
      chargePerAppointment,
      specialNotes,
    } = req.body;

    console.log("Request body:", req.body);
    console.log("Decoded token:", req.professional?.tokenData);

    if (
      !professionalId ||
      !professionalType ||
      !appointmentDate ||
      !startTime ||
      !endTime ||
      !chargePerAppointment
    ) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const decodedToken = req.professional?.tokenData;
    if (!decodedToken) {
      return res.status(403).json({ error: "Unauthorized: No professional data in token" });
    }

    const tokenPID =
      decodedToken.pID ||
      decodedToken.PID ||
      decodedToken.professionalId ||
      decodedToken.id ||
      decodedToken.sub;
    if (!tokenPID || tokenPID !== professionalId) {
      console.log("Professional ID mismatch:", {
        tokenPID,
        requestProfessionalId: professionalId,
      });
      return res.status(403).json({
        error: "Unauthorized: Professional ID does not match",
        details: { tokenPID, requestProfessionalId: professionalId },
      });
    }

    const validRoles = ["vet", "groomer", "pet-trainer"];
    const validTypes = ["vet", "groomer", "pet-trainer"];
    let tokenRole = decodedToken.role || decodedToken.type;
    if (!tokenRole) {
      return res.status(400).json({ error: "Role not found in token" });
    }
    if (!validRoles.includes(tokenRole)) {
      return res.status(400).json({ error: `Invalid role in token: ${tokenRole}` });
    }

    // No normalization needed since role is now "vet"
    const expectedType = tokenRole;
    if (!validTypes.includes(professionalType)) {
      return res.status(400).json({ error: `Invalid professional type: ${professionalType}` });
    }
    if (professionalType !== expectedType) {
      console.log("Professional type mismatch:", {
        tokenRole,
        expectedType,
        requestProfessionalType: professionalType,
      });
      return res.status(400).json({
        error: "Professional type does not match your role",
        details: { expectedType, requestProfessionalType: professionalType },
      });
    }

    const newAppointment = new AppointmentTemp({
      professionalId,
      professionalType,
      appointmentDate,
      startTime,
      endTime,
      chargePerAppointment,
      specialNotes,
    });

    const savedAppointment = await newAppointment.save();
    console.log("Saved appointment:", savedAppointment);

    res.status(201).json({
      message: "Appointment created successfully",
      data: savedAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Server error while creating appointment" });
  }
};








export const getVeterinarianAppointmentsRequest = async (req, res) => {
  try {
    const { date, professionalId, page = 1, limit = 10 } = req.query;

    const query = { professionalType: "vet" };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }
    if (professionalId) {
      query.professionalId = professionalId;
    }

    const vetAvailabilities = await AppointmentTemp.find(query)
      .sort({ appointmentDate: -1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Manually fetch professional details by matching professionalId with pID
    const professionalIds = vetAvailabilities.map((avail) => avail.professionalId);
    const professionals = await Professional.find({ pID: { $in: professionalIds } })
      .select("pID pName qualification pemail") // Changed 'role' to 'qualification'
      .lean();

    // Map professionals to a lookup object
    const professionalMap = professionals.reduce((acc, prof) => {
      acc[prof.pID] = prof;
      return acc;
    }, {});

    // Merge professional details into availabilities
    const formattedAvailabilities = vetAvailabilities.map((availability) => {
      const professional = professionalMap[availability.professionalId] || {};
      return {
        ...availability,
        professionalName: professional.pName || "Unknown",
        specialization: professional.qualification || "N/A", // Changed 'role' to 'qualification'
        email: professional.pemail || "N/A",
      };
    });

    const total = await AppointmentTemp.countDocuments(query);

    res.status(200).json({
      message: "Veterinarian availabilities retrieved successfully",
      data: formattedAvailabilities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching veterinarian availabilities:", error);
    res.status(500).json({
      error: "Server error while fetching veterinarian availabilities",
      details: error.message,
    });
  }
};











export const getGroomerAppointmentsRequest = async (req, res) => {
  try {
    const { date, doctorId, page = 1, limit = 10 } = req.query;
    const query = { professionalType: 'groomer' };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }
    if (doctorId) {
      query.professionalId = doctorId; // Update query to use professionalId
    }

    const groomerAvailabilities = await AppointmentTemp
      .find(query)
      .sort({ appointmentDate: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Log the raw appointments for debugging
    console.log("Raw groomer appointments:", groomerAvailabilities);

    // Fetch professional details for each appointment
    const groomerAvailabilitiesWithDetails = await Promise.all(
      groomerAvailabilities.map(async (appointment) => {
        // Use professionalId instead of doctorId
        const professional = await Professional.findOne({ 
          pID: { $regex: `^${appointment.professionalId}$`, $options: "i" },
          role: 'groomer'
        }).lean();
        
        // Log if professional is not found
        if (!professional) {
          console.warn(`Professional not found for pID: ${appointment.professionalId} and role: groomer`);
        }

        return {
          ...appointment,
          professionalName: professional?.pName || "N/A",
          email: professional?.pemail || "N/A",
          specialization: professional?.qualification || "N/A",
        };
      })
    );

    // Log the enriched data for debugging
    console.log("Groomer availabilities with details:", groomerAvailabilitiesWithDetails);

    const total = await AppointmentTemp.countDocuments(query);

    res.status(200).json({
      message: 'Groomer availabilities retrieved successfully',
      data: groomerAvailabilitiesWithDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching groomer availabilities:', error);
    res.status(500).json({ 
      error: 'Server error while fetching groomer availabilities',
      details: error.message 
    });
  }
};










export const getPetTrainerAppointmentsRequest = async (req, res) => {
  try {
    const { date, doctorId, page = 1, limit = 10 } = req.query;
    const query = { professionalType: 'pet-trainer' };
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    }
    if (doctorId) {
      query.professionalId = doctorId; // Update query to use professionalId
    }

    const trainerAvailabilities = await AppointmentTemp
      .find(query)
      .sort({ appointmentDate: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Log the raw appointments for debugging
    console.log("Raw pet trainer appointments:", trainerAvailabilities);

    // Fetch professional details for each appointment
    const trainerAvailabilitiesWithDetails = await Promise.all(
      trainerAvailabilities.map(async (appointment) => {
        // Use professionalId and match on role
        const professional = await Professional.findOne({ 
          pID: { $regex: `^${appointment.professionalId}$`, $options: "i" },
          role: 'pet-trainer'
        }).lean();
        
        // Log if professional is not found
        if (!professional) {
          console.warn(`Professional not found for pID: ${appointment.professionalId} and role: pet-trainer`);
        }

        return {
          ...appointment,
          professionalName: professional?.pName || "N/A",
          email: professional?.pemail || "N/A",
          specialization: professional?.qualification || "N/A",
        };
      })
    );

    // Log the enriched data for debugging
    console.log("Pet trainer availabilities with details:", trainerAvailabilitiesWithDetails);

    const total = await AppointmentTemp.countDocuments(query);

    res.status(200).json({
      message: 'Pet trainer availabilities retrieved successfully',
      data: trainerAvailabilitiesWithDetails,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching pet trainer availabilities:', error);
    res.status(500).json({ 
      error: 'Server error while fetching pet trainer availabilities',
      details: error.message 
    });
  }
};










export const denyAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the appointment exists
    const appointment = await AppointmentTemp.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Delete the appointment
    await AppointmentTemp.findByIdAndDelete(id);

    res.status(200).json({ 
      message: 'Appointment denied and deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error denying appointment:', error);
    res.status(500).json({ 
      error: 'Server error while denying appointment',
      details: error.message 
    });
  }
};












export const acceptAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the temporary appointment
    const tempAppointment = await AppointmentTemp.findById(id);
    if (!tempAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Fetch professional details to get name and email
    const professional = await Professional.findOne({ pID: tempAppointment.professionalId }).lean();
    if (!professional) {
      return res.status(404).json({ error: "Professional not found" });
    }

    // Create a new confirmed appointment
    const confirmedAppointment = new ConfirmAppointmentReq({
      doctorId: tempAppointment.professionalId,
      professionalType: tempAppointment.professionalType,
      appointmentDate: tempAppointment.appointmentDate,
      startTime: tempAppointment.startTime,
      endTime: tempAppointment.endTime,
      chargePerAppointment: tempAppointment.chargePerAppointment,
      specialNotes: tempAppointment.specialNotes,
      status: "confirmed",
    });

    // Save the confirmed appointment
    await confirmedAppointment.save();

    // Create a notification entry
    const notification = new ProfessionalNotification({
      professionalId: tempAppointment.professionalId,
      professionalName: professional.pName,
      email: professional.pemail,
      appointmentDate: tempAppointment.appointmentDate,
      startTime: tempAppointment.startTime,
      endTime: tempAppointment.endTime,
      charge: tempAppointment.chargePerAppointment,
      notificationType: "appointment_accepted",
    });

    // Save the notification
    await notification.save();

    // Send an email to the professional (non-blocking)
    const emailSubject = "Appointment Accepted - PetCare System";
    const emailText = `Dear ${professional.pName},\n\nYour appointment request has been accepted.\n\nDetails:\n- Date: ${new Date(tempAppointment.appointmentDate).toLocaleDateString()}\n- Time: ${tempAppointment.startTime} to ${tempAppointment.endTime}\n- Charge: $${tempAppointment.chargePerAppointment}\n\nThank you for using the PetCare System.\n\nBest regards,\nPetCare Team`;
    const emailHtml = `
      <h2>Appointment Accepted</h2>
      <p>Dear ${professional.pName},</p>
      <p>Your appointment request has been accepted.</p>
      <h3>Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${new Date(tempAppointment.appointmentDate).toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${tempAppointment.startTime} to ${tempAppointment.endTime}</li>
        <li><strong>Charge:</strong> $${tempAppointment.chargePerAppointment}</li>
      </ul>
      <p>Thank you for using the PetCare System.</p>
      <p>Best regards,<br>PetCare Team</p>
    `;
    sendEmail({
      to: professional.pemail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    }).catch((err) => {
      console.error("Failed to send email after acceptance:", err);
    });

    // Delete the temporary appointment
    await AppointmentTemp.findByIdAndDelete(id);

    res.status(200).json({
      message: "Appointment accepted and moved to confirmed requests",
      confirmedAppointment,
    });
  } catch (error) {
    console.error("Error accepting appointment:", error);
    res.status(500).json({
      error: "Server error while accepting appointment",
      details: error.message,
    });
  }
};












export const getProfessionalAppointments = async (req, res) => {
  try {
    const professionalId = req.professional.pID; // From JWT middleware (using pID)
    const appointments = await Appointment.find({ doctorId: professionalId, status: "scheduled" })
      .select("-__v -paymentIntentId")
      .sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching professional appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
};


















export const getPetDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const professionalId = req.professional.pID;

    const appointment = await Appointment.findById(appointmentId).populate('userId', 'name email phoneNumber city');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctorId !== professionalId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const pet = await Pet.findOne({ userId: appointment.userId });

    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found for this user' });
    }

    res.json({
      success: true,
      user: {
        id: appointment.userId._id,
        name: appointment.userId.name,
        email: appointment.userId.email,
        phoneNumber: appointment.userId.phoneNumber,
        city: appointment.userId.city,
      },
      pet: {
        id: pet._id,
        name: pet.name,
        breed: pet.breed,
        age: pet.age,
        vaccinations: pet.vaccinations || 'None',
        specialNotes: pet.specialNotes || 'None',
        medicalRecords: pet.medicalRecords || [],
      },
    });
  } catch (error) {
    console.error('Error fetching pet details:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

















export const addMedicalRecord = async (req, res) => {
  try {
    const { userId, type, description } = req.body;
    const doctorId = req.professional.pID;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    if (!['vaccination', 'medical'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid record type' });
    }

    if (!description?.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    const pet = await Pet.findOne({ userId });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    const newRecord = {
      type,
      description: description.trim(),
      doctorId,
      date: new Date(),
    };

    pet.medicalRecords.push(newRecord);
    await pet.save();

    res.status(201).json({
      success: true,
      message: 'Medical record added successfully',
      record: newRecord,
    });
  } catch (error) {
    console.error('Error adding medical record:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
















  export const getPetDetailsForAppointment = async (req, res) => {
    try {
      const { appointmentId } = req.params;
  
      console.log('Fetching pet details for appointmentId:', appointmentId);
  
      if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
        return res.status(400).json({ message: 'Invalid appointment ID format' });
      }
  
      const appointment = await Appointment.findById(appointmentId).lean();
      if (!appointment) {
        return res.status(422).json({ message: 'No appointment found with this ID' });
      }
  
      const professionalId = req.professional?.pID ? String(req.professional.pID).trim() : null;
      const appointmentDoctorId = appointment.doctorId ? String(appointment.doctorId).trim() : null;
      if (!professionalId || !appointmentDoctorId || professionalId !== appointmentDoctorId) {
        return res.status(403).json({ message: 'Unauthorized: You are not assigned to this appointment' });
      }
  
      const appointmentUserId = appointment.userId;
      if (!appointmentUserId) {
        return res.status(422).json({ message: 'Appointment is missing user ID' });
      }
  
      const pet = await Pet.findOne({ userId: appointmentUserId }).lean();
      if (!pet) {
        return res.status(422).json({ message: `No pet found for user ID ${appointmentUserId}` });
      }
  
      // Exclude petimage from response
      const { petimage, ...petData } = pet;
  
      console.log('Pet details fetched:', petData);
  
      res.status(200).json({
        appointment,
        pet: petData,
      });
    } catch (error) {
      console.error('Error fetching pet details:', {
        message: error.message,
        stack: error.stack,
        appointmentId: req.params.appointmentId,
      });
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };









const updateExpiredAppointments = async () => {
  try {
    const now = new Date();
    const expiredAppointments = await Appointment.find({
      status: 'scheduled',
      appointmentDate: { $lt: now },
    });

    for (const appointment of expiredAppointments) {
      appointment.status = 'missed';
      await appointment.save();
    }
  } catch (error) {
    console.error('Error updating expired appointments:', error.message, error.stack);
  }
};



export const addPetReport = async (req, res) => {
  try {
    await updateExpiredAppointments();

    const { appointmentId } = req.params;
    const { type, diagnosis, treatment, groomingService, groomerNotes, trainingFocus, trainerNotes, description, doctorId } = req.body;

    console.log('Adding report for appointmentId:', appointmentId, 'Request Body:', req.body);

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(422).json({ message: 'No appointment found with this ID' });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: `Cannot add report for a ${appointment.status} appointment` });
    }

    const professionalId = req.professional?.pID ? String(req.professional.pID).trim() : null;
    const appointmentDoctorId = appointment.doctorId ? String(appointment.doctorId).trim() : null;
    if (!professionalId || !appointmentDoctorId || professionalId !== appointmentDoctorId) {
      return res.status(403).json({ message: 'Unauthorized: You are not assigned to this appointment' });
    }

    const appointmentUserId = appointment.userId;
    if (!appointmentUserId) {
      return res.status(422).json({ message: 'Appointment is missing user ID' });
    }

    const pet = await Pet.findOne({ userId: appointmentUserId });
    if (!pet) {
      return res.status(422).json({ message: `No pet found for user ID ${appointmentUserId}` });
    }

    console.log('Pet before update:', { petId: pet.petId, medicalRecords: pet.medicalRecords });

    if (type === 'Medical') {
      if (!diagnosis || diagnosis.trim() === '' || !treatment || treatment.trim() === '') {
        return res.status(400).json({ message: 'Diagnosis and treatment are required for a Medical report and cannot be empty' });
      }
    } else if (type === 'Grooming') {
      if (!groomingService || groomingService.trim() === '' || !groomerNotes || groomerNotes.trim() === '') {
        return res.status(400).json({ message: 'Grooming service and notes are required for a Grooming report and cannot be empty' });
      }
    } else if (type === 'Training') {
      if (!trainingFocus || trainingFocus.trim() === '' || !trainerNotes || trainerNotes.trim() === '') {
        return res.status(400).json({ message: 'Training focus and notes are required for a Training report and cannot be empty' });
      }
    } else if (type === 'vaccination') {
      if (!description || description.trim() === '' || !doctorId) {
        return res.status(400).json({ message: 'Description and doctorId are required for a Vaccination report and cannot be empty' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    const newReport = {
      type,
      date: new Date(),
      ...(type === 'Medical' && { diagnosis: diagnosis.trim(), treatment: treatment.trim() }),
      ...(type === 'Grooming' && { groomingService: groomingService.trim(), groomerNotes: groomerNotes.trim() }),
      ...(type === 'Training' && { trainingFocus: trainingFocus.trim(), trainerNotes: trainerNotes.trim() }),
      ...(type === 'vaccination' && { description: description.trim(), doctorId }),
    };

    console.log('New Report to Add:', newReport);

    pet.medicalRecords.push(newReport);
    console.log('Attempting to save pet document...');
    await pet.save();

    console.log('Pet after update:', { petId: pet.petId, medicalRecords: pet.medicalRecords });

    res.status(201).json({
      message: 'Report added successfully',
      report: newReport,
      updatedMedicalRecords: pet.medicalRecords,
    });
  } catch (error) {
    console.error('Error adding pet report:', {
      message: error.message,
      stack: error.stack,
      appointmentId: req.params.appointmentId,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deletePetReport = async (req, res) => {
  try {
    await updateExpiredAppointments();

    const { appointmentId, reportId } = req.params;

    console.log('Deleting report:', { appointmentId, reportId });

    if (!mongoose.Types.ObjectId.isValid(appointmentId) || !mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: 'Invalid appointment or report ID format' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(422).json({ message: 'No appointment found with this ID' });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: `Cannot delete report for a ${appointment.status} appointment` });
    }

    const professionalId = req.professional?.pID ? String(req.professional.pID).trim() : null;
    const appointmentDoctorId = appointment.doctorId ? String(appointment.doctorId).trim() : null;
    if (!professionalId || !appointmentDoctorId || professionalId !== appointmentDoctorId) {
      return res.status(403).json({ message: 'Unauthorized: You are not assigned to this appointment' });
    }

    const appointmentUserId = appointment.userId;
    if (!appointmentUserId) {
      return res.status(422).json({ message: 'Appointment is missing user ID' });
    }

    const pet = await Pet.findOne({ userId: appointmentUserId });
    if (!pet) {
      return res.status(422).json({ message: `No pet found for user ID ${appointmentUserId}` });
    }

    const reportIndex = pet.medicalRecords.findIndex(
      (report) => report._id.toString() === reportId
    );
    if (reportIndex === -1) {
      return res.status(404).json({ message: 'Report not found' });
    }

    pet.medicalRecords.splice(reportIndex, 1);
    await pet.save();

    console.log('Report deleted, updated medicalRecords:', pet.medicalRecords);

    res.status(200).json({
      message: 'Report deleted successfully',
      updatedMedicalRecords: pet.medicalRecords,
    });
  } catch (error) {
    console.error('Error deleting pet report:', {
      message: error.message,
      stack: error.stack,
      appointmentId: req.params.appointmentId,
      reportId: req.params.reportId,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updatePetReport = async (req, res) => {
  try {
    await updateExpiredAppointments();

    const { appointmentId, reportId } = req.params;
    const { type, diagnosis, treatment, groomingService, groomerNotes, trainingFocus, trainerNotes, description, doctorId } = req.body;

    console.log('Updating report:', { appointmentId, reportId, requestBody: req.body });

    if (!mongoose.Types.ObjectId.isValid(appointmentId) || !mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ message: 'Invalid appointment or report ID format' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(422).json({ message: 'No appointment found with this ID' });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: `Cannot update report for a ${appointment.status} appointment` });
    }

    const professionalId = req.professional?.pID ? String(req.professional.pID).trim() : null;
    const appointmentDoctorId = appointment.doctorId ? String(appointment.doctorId).trim() : null;
    if (!professionalId || !appointmentDoctorId || professionalId !== appointmentDoctorId) {
      return res.status(403).json({ message: 'Unauthorized: You are not assigned to this appointment' });
    }

    const appointmentUserId = appointment.userId;
    if (!appointmentUserId) {
      return res.status(422).json({ message: 'Appointment is missing user ID' });
    }

    const pet = await Pet.findOne({ userId: appointmentUserId });
    if (!pet) {
      return res.status(422).json({ message: `No pet found for user ID ${appointmentUserId}` });
    }

    const report = pet.medicalRecords.find(
      (report) => report._id.toString() === reportId
    );
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (type === 'Medical') {
      if (!diagnosis || diagnosis.trim() === '' || !treatment || treatment.trim() === '') {
        return res.status(400).json({ message: 'Diagnosis and treatment are required for a Medical report and cannot be empty' });
      }
    } else if (type === 'Grooming') {
      if (!groomingService || groomingService.trim() === '' || !groomerNotes || groomerNotes.trim() === '') {
        return res.status(400).json({ message: 'Grooming service and notes are required for a Grooming report and cannot be empty' });
      }
    } else if (type === 'Training') {
      if (!trainingFocus || trainingFocus.trim() === '' || !trainerNotes || trainerNotes.trim() === '') {
        return res.status(400).json({ message: 'Training focus and notes are required for a Training report and cannot be empty' });
      }
    } else if (type === 'vaccination') {
      if (!description || description.trim() === '' || !doctorId) {
        return res.status(400).json({ message: 'Description and doctorId are required for a Vaccination report and cannot be empty' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid report type' });
    }

    report.type = type;
    report.date = new Date();
    if (type === 'Medical') {
      report.diagnosis = diagnosis.trim();
      report.treatment = treatment.trim();
      report.groomingService = undefined;
      report.groomerNotes = undefined;
      report.trainingFocus = undefined;
      report.trainerNotes = undefined;
      report.description = undefined;
      report.doctorId = undefined;
    } else if (type === 'Grooming') {
      report.groomingService = groomingService.trim();
      report.groomerNotes = groomerNotes.trim();
      report.diagnosis = undefined;
      report.treatment = undefined;
      report.trainingFocus = undefined;
      report.trainerNotes = undefined;
      report.description = undefined;
      report.doctorId = undefined;
    } else if (type === 'Training') {
      report.trainingFocus = trainingFocus.trim();
      report.trainerNotes = trainerNotes.trim();
      report.diagnosis = undefined;
      report.treatment = undefined;
      report.groomingService = undefined;
      report.groomerNotes = undefined;
      report.description = undefined;
      report.doctorId = undefined;
    } else if (type === 'vaccination') {
      report.description = description.trim();
      report.doctorId = doctorId;
      report.diagnosis = undefined;
      report.treatment = undefined;
      report.groomingService = undefined;
      report.groomerNotes = undefined;
      report.trainingFocus = undefined;
      report.trainerNotes = undefined;
    }

    await pet.save();

    console.log('Report updated, updated medicalRecords:', pet.medicalRecords);

    res.status(200).json({
      message: 'Report updated successfully',
      updatedMedicalRecords: pet.medicalRecords,
    });
  } catch (error) {
    console.error('Error updating pet report:', {
      message: error.message,
      stack: error.stack,
      appointmentId: req.params.appointmentId,
      reportId: req.params.reportId,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const endAppointment = async (req, res) => {
  try {
    await updateExpiredAppointments();

    const { appointmentId } = req.params;

    console.log('Ending appointment:', appointmentId);

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: 'Invalid appointment ID format' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(422).json({ message: 'No appointment found with this ID' });
    }

    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ message: `Cannot end a ${appointment.status} appointment` });
    }

    const professionalId = req.professional?.pID ? String(req.professional.pID).trim() : null;
    const appointmentDoctorId = appointment.doctorId ? String(appointment.doctorId).trim() : null;
    if (!professionalId || !appointmentDoctorId || professionalId !== appointmentDoctorId) {
      return res.status(403).json({ message: 'Unauthorized: You are not assigned to this appointment' });
    }

    appointment.status = 'completed';
    await appointment.save();

    console.log('Appointment ended:', appointment);

    res.status(200).json({
      message: 'Appointment ended successfully',
      appointment,
    });
  } catch (error) {
    console.error('Error ending appointment:', {
      message: error.message,
      stack: error.stack,
      appointmentId: req.params.appointmentId,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



















export const getAppointmentTypeDistribution = async (req, res) => {
  try {
    if (!req.professional) {
      console.log('No professional data in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const professionalId = req.professional.tokenData.id;
    console.log('Professional ID from token:', professionalId);

    const professional = await Professional.findById(professionalId);
    if (!professional) {
      console.log('Professional not found for ID:', professionalId);
      return res.status(404).json({ message: 'Professional not found' });
    }
    const pID = professional.pID;
    console.log('Fetching type distribution for pID:', pID);

    const distribution = await Appointment.aggregate([
      { $match: { doctorId: pID, status: { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$appointmentType',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          appointmentType: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    console.log('Type distribution result:', distribution);
    res.json(distribution);
  } catch (error) {
    console.error('Error in getAppointmentTypeDistribution:', {
      message: error.message,
      stack: error.stack,
      professionalId: req.professional?.tokenData?.id,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment status over time for bar chart
export const getAppointmentStatusOverTime = async (req, res) => {
  try {
    if (!req.professional) {
      console.log('No professional data in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const professionalId = req.professional.tokenData.id;
    console.log('Professional ID from token:', professionalId);

    const professional = await Professional.findById(professionalId);
    if (!professional) {
      console.log('Professional not found for ID:', professionalId);
      return res.status(404).json({ message: 'Professional not found' });
    }
    const pID = professional.pID;
    console.log('Fetching status over time for pID:', pID);

    const statusOverTime = await Appointment.aggregate([
      {
        $match: {
          doctorId: pID,
          appointmentDate: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
          '_id.status': 1,
        },
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          status: '$_id.status',
          count: 1,
          _id: 0,
        },
      },
    ]);

    console.log('Status over time result:', statusOverTime);
    res.json(statusOverTime);
  } catch (error) {
    console.error('Error in getAppointmentStatusOverTime:', {
      message: error.message,
      stack: error.stack,
      professionalId: req.professional?.tokenData?.id,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment fee distribution
export const getAppointmentFeeDistribution = async (req, res) => {
  try {
    if (!req.professional) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const professionalId = req.professional.tokenData.id;
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }
    const pID = professional.pID;
    console.log('Fetching fee distribution for pID:', pID);

    const distribution = await Appointment.aggregate([
      { $match: { doctorId: pID, status: { $ne: 'cancelled' } } },
      {
        $bucket: {
          groupBy: '$appointmentFee',
          boundaries: [0, 50, 100, 200, 500, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
          },
        },
      },
      {
        $project: {
          feeRange: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: '< $50' },
                { case: { $eq: ['$_id', 50] }, then: '$50 - $100' },
                { case: { $eq: ['$_id', 100] }, then: '$100 - $200' },
                { case: { $eq: ['$_id', 200] }, then: '$200 - $500' },
                { case: { $eq: ['$_id', 500] }, then: '>= $500' },
              ],
              default: 'Other',
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);

    console.log('Fee distribution result:', distribution);
    res.json(distribution);
  } catch (error) {
    console.error('Error in getAppointmentFeeDistribution:', {
      message: error.message,
      stack: error.stack,
      professionalId: req.professional?.tokenData?.id,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment date distribution
export const getAppointmentDateDistribution = async (req, res) => {
  try {
    if (!req.professional) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const professionalId = req.professional.tokenData.id;
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }
    const pID = professional.pID;
    console.log('Fetching date distribution for pID:', pID);

    const distribution = await Appointment.aggregate([
      {
        $match: {
          doctorId: pID,
          appointmentDate: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          count: 1,
          _id: 0,
        },
      },
    ]);

    console.log('Date distribution result:', distribution);
    res.json(distribution);
  } catch (error) {
    console.error('Error in getAppointmentDateDistribution:', {
      message: error.message,
      stack: error.stack,
      professionalId: req.professional?.tokenData?.id,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment status distribution
export const getPaymentStatusDistribution = async (req, res) => {
  try {
    if (!req.professional) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const professionalId = req.professional.tokenData.id;
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }
    const pID = professional.pID;
    console.log('Fetching payment status distribution for pID:', pID);

    const distribution = await Appointment.aggregate([
      { $match: { doctorId: pID } },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          paymentStatus: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    console.log('Payment status distribution result:', distribution);
    res.json(distribution);
  } catch (error) {
    console.error('Error in getPaymentStatusDistribution:', {
      message: error.message,
      stack: error.stack,
      professionalId: req.professional?.tokenData?.id,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get appointment time slot distribution
export const getAppointmentTimeSlotDistribution = async (req, res) => {
  try {
    if (!req.professional) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const professionalId = req.professional.tokenData.id;
    const professional = await Professional.findById(professionalId);
    if (!professional) {
      return res.status(404).json({ message: 'Professional not found' });
    }
    const pID = professional.pID;
    console.log('Fetching time slot distribution for pID:', pID);

    const distribution = await Appointment.aggregate([
      {
        $match: {
          doctorId: pID,
          appointmentTime: { $ne: null },
        },
      },
      {
        $addFields: {
          hour: {
            $toInt: {
              $substr: ['$appointmentTime', 0, 2],
            },
          },
        },
      },
      {
        $bucket: {
          groupBy: '$hour',
          boundaries: [0, 12, 18, 24],
          default: 'Other',
          output: {
            count: { $sum: 1 },
          },
        },
      },
      {
        $project: {
          timeSlot: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: 'Morning (00:00 - 11:59)' },
                { case: { $eq: ['$_id', 12] }, then: 'Afternoon (12:00 - 17:59)' },
                { case: { $eq: ['$_id', 18] }, then: 'Evening (18:00 - 23:59)' },
              ],
              default: 'Other',
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);

    console.log('Time slot distribution result:', distribution);
    res.json(distribution);
  } catch (error) {
    console.error('Error in getAppointmentTimeSlotDistribution:', {
      message: error.message,
      stack: error.stack,
      professionalId: req.professional?.tokenData?.id,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
















export const getMonthlyIncomeReport = async (req, res) => {
  try {
    if (!req.professional) {
      console.log('No professional data in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const professionalId = req.professional.tokenData.id;
    console.log('Professional ID from token:', professionalId);

    const professional = await Professional.findById(professionalId);
    if (!professional) {
      console.log('Professional not found for ID:', professionalId);
      return res.status(404).json({ message: 'Professional not found' });
    }
    const pID = professional.pID;
    console.log('Fetching income report for pID:', pID);

    const incomeReport = await Appointment.aggregate([
      {
        $match: {
          doctorId: pID,
          status: { $in: ['scheduled', 'completed'] },
          appointmentDate: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' },
          },
          totalIncome: { $sum: '$appointmentFee' },
          appointmentCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          totalIncome: 1,
          appointmentCount: 1,
          _id: 0,
        },
      },
    ]);

    console.log('Income report result:', incomeReport);
    res.json(incomeReport);
  } catch (error) {
    console.error('Error in getMonthlyIncomeReport:', {
      message: error.message,
      stack: error.stack,
      professionalId: req.professional?.tokenData?.id,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pets and their users report
export const getPetsUsersReport = async (req, res) => {
  try {
    if (!req.professional) {
      console.log('No professional data in request');
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const professionalId = req.professional.tokenData.id;
    console.log('Professional ID from token:', professionalId);

    const professional = await Professional.findById(professionalId);
    if (!professional) {
      console.log('Professional not found for ID:', professionalId);
      return res.status(404).json({ message: 'Professional not found' });
    }
    const pID = professional.pID;
    console.log('Fetching pets-users report for pID:', pID);

    const appointments = await Appointment.find({ doctorId: pID })
      .select('userId')
      .lean();
    console.log('Appointments found:', appointments);

    const userIds = [...new Set(appointments.map((appt) => appt.userId))];
    console.log('User IDs:', userIds);

    const users = await User.find({ _id: { $in: userIds } })
      .select('name email phoneNumber')
      .lean();
    console.log('Users found:', users);

    const pets = await Pet.find({ userId: { $in: userIds } })
      .select('name breed userId')
      .lean();
    console.log('Pets found:', pets);

    const report = pets.map((pet) => {
      const user = users.find((u) => {
        const match = u._id.toString() === pet.userId.toString();
        console.log('Comparing user._id:', u._id.toString(), 'with pet.userId:', pet.userId.toString(), 'Match:', match);
        return match;
      });
      return {
        petName: pet.name,
        petType: pet.breed,
        ownerName: user ? user.name : 'Unknown',
        ownerEmail: user ? user.email : 'N/A',
        ownerPhone: user ? user.phoneNumber : 'N/A',
      };
    });

    console.log('Pets-users report result:', report);
    res.json(report);
  } catch (error) {
    console.error('Error in getPetsUsersReport:', {
      message: error.message,
      stack: error.stack,
      professionalId: req.professional?.tokenData?.id,
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};









export const getPetById = async (req, res) => {
  try {
    const { petId } = req.params;
    console.log('Fetching pet with petId:', petId);

    // Remove '#' prefix if present
    const cleanPetId = petId.startsWith('#') ? petId.slice(1) : petId;

    // Find pet by petId
    const pet = await Pet.findOne({ petId: cleanPetId }).lean();
    if (!pet) {
      console.log('Pet not found for petId:', cleanPetId);
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Format medical records by category
    const medicalHistory = pet.medicalRecords
      .filter((record) => record.type === 'Medical')
      .map((record) => ({
        date: record.date.toISOString().split('T')[0],
        diagnosis: record.diagnosis || 'N/A',
        treatment: record.treatment || 'N/A',
      }));

    const groomingHistory = pet.medicalRecords
      .filter((record) => record.type === 'Grooming')
      .map((record) => ({
        date: record.date.toISOString().split('T')[0],
        service: record.groomingService || 'N/A',
        notes: record.groomerNotes || 'N/A',
      }));

    const trainingHistory = pet.medicalRecords
      .filter((record) => record.type === 'Training')
      .map((record) => ({
        date: record.date.toISOString().split('T')[0],
        focus: record.trainingFocus || 'N/A',
        notes: record.trainerNotes || 'N/A',
      }));

    const vaccinationHistory = pet.medicalRecords
      .filter((record) => record.type === 'vaccination')
      .map((record) => ({
        date: record.date.toISOString().split('T')[0],
        description: record.description || 'N/A',
        doctorId: record.doctorId || 'N/A',
      }));

    // Prepare response
    const responseData = {
      id: pet.petId,
      medicalHistory,
      groomingHistory,
      trainingHistory,
      vaccinationHistory,
    };

    console.log('Pet medical data sent:', responseData);
    res.json({ data: responseData });
  } catch (error) {
    console.error('Error in getPetById:', {
      message: error.message,
      stack: error.stack,
      petId: req.params.petId,
    });
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};














export const getRefundRequests = async (req, res) => {
  try {
    console.log('Fetching refund requests'); // Debug log
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const requests = await RefundRequest.find()
      .populate({
        path: 'appointmentId',
        select: 'appointmentDate appointmentTime status',
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await RefundRequest.countDocuments();

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching refund requests:', error); // Debug log
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund requests',
      error: error.message,
    });
  }
};






























export const processRefundRequest = async (req, res) => {
try {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value'
    });
  }

  const request = await RefundRequest.findById(id).populate('appointmentId', 'appointmentDate appointmentTime');
  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Refund request not found'
    });
  }

  if (request.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Request has already been processed'
    });
  }

  // Check if appointment date has passed (only for approvals)
  if (status === 'approved' && new Date(request.appointmentId.appointmentDate) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot approve refund for past appointments'
    });
  }

  request.status = status;
  request.processedDate = status !== 'pending' ? new Date() : null; // Set processedDate
  request.metadata.processorId = req.user?.id || 'system'; // Optional: Track who processed it
  await request.save();

  res.status(200).json({
    success: true,
    message: `Refund request ${status}`,
    data: request
  });
} catch (error) {
  res.status(500).json({
    success: false,
    message: 'Failed to process refund request',
    error: error.message
  });
}
};













export const getActiveProfessionals = async (req, res) => {
  try {
    const { filter = 'all' } = req.query;

    // Define date filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of the week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of the week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);

    // Build the query based on the filter
    const query = { status: 'confirmed' };
    if (filter === 'today') {
      query.appointmentDate = { $gte: today, $lte: endOfToday };
    } else if (filter === 'this-week') {
      query.appointmentDate = { $gte: startOfWeek, $lte: endOfWeek };
    }

    // Fetch confirmed appointments
    const confirmedAppointments = await ConfirmAppointmentReq.find(query)
      .sort({ appointmentDate: 1, startTime: 1 })
      .lean();

    // Log raw appointments for debugging
    console.log("Raw confirmed appointments:", confirmedAppointments);

    // Fetch professional details for each appointment
    const appointmentsWithDetails = await Promise.all(
      confirmedAppointments.map(async (appointment) => {
        const professional = await Professional.findOne({
          pID: { $regex: `^${appointment.doctorId}$`, $options: "i" },
          role: appointment.professionalType,
        }).lean();

        if (!professional) {
          console.warn(`Professional not found for pID: ${appointment.doctorId} and role: ${appointment.professionalType}`);
        }

        return {
          ...appointment,
          professionalName: professional?.pName || "N/A",
          email: professional?.pemail || "N/A",
          qualification: professional?.qualification || "N/A",
          experience: professional?.experience || "N/A",
          phoneNumber: professional?.pphoneNumber || "N/A",
        };
      })
    );

    // Log enriched data for debugging
    console.log("Appointments with professional details:", appointmentsWithDetails);

    // Group appointments by professional type
    const groupedByType = {
      vet: appointmentsWithDetails.filter((appt) => appt.professionalType === 'vet'),
      groomer: appointmentsWithDetails.filter((appt) => appt.professionalType === 'groomer'),
      'pet-trainer': appointmentsWithDetails.filter((appt) => appt.professionalType === 'pet-trainer'),
    };

    res.status(200).json({
      message: 'Active professionals retrieved successfully',
      data: groupedByType,
    });
  } catch (error) {
    console.error('Error fetching active professionals:', error);
    res.status(500).json({
      error: 'Server error while fetching active professionals',
      details: error.message,
    });
  }
};












// Helper function to calculate date range
const getDateRange = (period, startDate, endDate) => {
  console.log(`Calculating date range for period: ${period}, startDate: ${startDate}, endDate: ${endDate}`);
  const now = new Date();
  let start, end;

  if (period === 'daily') {
    start = new Date(now.setHours(0, 0, 0, 0));
    end = new Date(now.setHours(23, 59, 59, 999));
  } else if (period === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (period === 'custom' && startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else {
    throw new Error('Invalid period or missing dates');
  }

  console.log(`Date range calculated: start=${start}, end=${end}`);
  return { start, end };
};

// Controller function for report generation
export const generateReports = async (req, res) => {
  console.log('Starting report generation...');
  try {
    // Check if required models are defined
    if (!Appointment) {
      throw new Error('Appointment model not defined');
    }
    if (!Professional) {
      throw new Error('Professional model not defined');
    }
    if (!ConfirmAppointmentReq) {
      throw new Error('ConfirmAppointmentReq model not defined');
    }
    if (!RefundRequest) {
      throw new Error('RefundRequest model not defined');
    }

    const { period, startDate, endDate } = req.query;

    // Validate period
    if (!['daily', 'monthly', 'custom'].includes(period)) {
      console.log('Invalid period provided:', period);
      return res.status(400).json({ 
        message: 'Invalid period provided', 
        error: 'Period must be daily, monthly, or custom' 
      });
    }

    const { start, end } = getDateRange(period, startDate, endDate);

    // 1. Revenue by Appointment Category (Payment Status: Paid)
    console.log('Fetching revenue by appointment category (paid)...');
    const revenueByCategory = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: start, $lte: end },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: '$appointmentType',
          totalRevenue: { $sum: '$appointmentFee' },
          appointmentCount: { $sum: 1 },
        },
      },
      {
        $project: {
          category: '$_id',
          totalRevenue: 1,
          appointmentCount: 1,
          _id: 0,
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
    ]);
    console.log('Revenue by appointment category:', revenueByCategory);

    // 2. Scheduled vs. Cancelled Appointments Breakdown
    console.log('Fetching scheduled vs. cancelled appointments breakdown...');
    const scheduledVsCancelled = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            appointmentType: '$appointmentType',
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.appointmentType',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
            },
          },
        },
      },
      {
        $project: {
          appointmentType: '$_id',
          scheduled: {
            $arrayElemAt: [
              '$statuses.count',
              { $indexOfArray: ['$statuses.status', 'scheduled'] },
            ],
          },
          completed: {
            $arrayElemAt: [
              '$statuses.count',
              { $indexOfArray: ['$statuses.status', 'completed'] },
            ],
          },
          cancelled: {
            $arrayElemAt: [
              '$statuses.count',
              { $indexOfArray: ['$statuses.status', 'cancelled'] },
            ],
          },
          _id: 0,
        },
      },
      {
        $project: {
          appointmentType: 1,
          scheduled: { $ifNull: ['$scheduled', 0] },
          completed: { $ifNull: ['$completed', 0] },
          cancelled: { $ifNull: ['$cancelled', 0] },
          scheduledOrCompleted: { $add: [{ $ifNull: ['$scheduled', 0] }, { $ifNull: ['$completed', 0] }] },
        },
      },
      {
        $sort: { appointmentType: 1 },
      },
    ]).then(results => results.map(item => ({
      ...item,
      appointmentType: item.appointmentType || 'Unknown',
      scheduled: item.scheduled || 0,
      completed: item.completed || 0,
      cancelled: item.cancelled || 0,
      scheduledOrCompleted: item.scheduledOrCompleted || 0,
    })));
    console.log('Scheduled vs. cancelled appointments breakdown:', scheduledVsCancelled);

    // 3. Customer Appointment Frequency
    console.log('Fetching customer appointment frequency...');
    const customerFrequency = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$userId',
          appointmentCount: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$appointmentCount',
          customerCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          appointmentCount: '$_id',
          customerCount: 1,
          _id: 0,
        },
      },
    ]).then(results => results.map(item => ({
      ...item,
      appointmentCount: item.appointmentCount || 0,
      customerCount: item.customerCount || 0,
    })));
    console.log('Customer appointment frequency:', customerFrequency);

    // Prepare the response data
    const reportData = {
      revenueByCategory: revenueByCategory.length ? revenueByCategory : [],
      scheduledVsCancelled: scheduledVsCancelled.length ? scheduledVsCancelled : [],
      customerFrequency: customerFrequency.length ? customerFrequency : [],
    };

    console.log('Report generation successful:', reportData);
    res.status(200).json({
      message: 'Report generated successfully',
      data: reportData,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ 
      message: 'Server error while generating report', 
      error: error.message 
    });
  }
};




export const getAllRefundRequests = async (req, res) => {
  try {
    console.log('Fetching all refund requests from /refundrequestforreview...');

    // Fetch refund requests with populated appointmentId
    const refundRequests = await RefundRequest.find()
      .populate({
        path: 'appointmentId',
        select: 'appointmentDate appointmentTime status',
        options: { strictPopulate: false },
      })
      .lean();

    if (!refundRequests || refundRequests.length === 0) {
      console.log('No refund requests found.');
      return res.status(200).json([]);
    }

    // Extract unique userIds and validate
    const userIds = refundRequests
      .map((request) => request.userId?.toString())
      .filter((id) => id && mongoose.isValidObjectId(id));

    if (userIds.length === 0) {
      console.warn('No valid userIds found in refund requests.');
    }

    // Fetch user names
    const users = await User.find({ _id: { $in: userIds } })
      .select('name')
      .lean();

    // Create a map of userId to user name
    const userMap = users.reduce((map, user) => {
      map[user._id.toString()] = user.name;
      return map;
    }, {});

    // Attach user name to each refund request
    const refundRequestsWithUserNames = refundRequests.map((request) => ({
      ...request,
      userId: {
        _id: request.userId?.toString() || 'N/A',
        name: userMap[request.userId?.toString()] || 'Unknown User',
      },
    }));

    console.log('Refund requests fetched:', refundRequestsWithUserNames.length);
    res.status(200).json(refundRequestsWithUserNames);
  } catch (error) {
    console.error('Error fetching refund requests:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch refund requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
}; 

// Update refund request status
export const updateRefundStatus = async (req, res) => {
  try {
    const { id } = req.params; // Refund request ID from URL
    const { status } = req.body; // Status from request body ("approved" or "rejected")

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected".',
      });
    }

    // Find the refund request
    const refundRequest = await RefundRequest.findById(id);
    if (!refundRequest) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found.',
      });
    }

    // Check if the refund request is in "pending" status
    if (refundRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update refund request. Status is already ${refundRequest.status}.`,
      });
    }

    // Update the status and processed date
    refundRequest.status = status;
    refundRequest.processedDate = new Date();
    await refundRequest.save();

    // Populate appointmentId for the response
    await refundRequest.populate({
      path: 'appointmentId',
      select: 'appointmentDate appointmentTime status',
      options: { strictPopulate: false },
    });

    // Manually fetch the user name for the response
    const user = await User.findById(refundRequest.userId).select('name').lean();
    const refundRequestWithUserName = {
      ...refundRequest.toObject(),
      userId: {
        _id: refundRequest.userId,
        name: user?.name || 'N/A',
      },
    };

    console.log(`Refund request ${id} updated to status: ${status}`);
    res.status(200).json({
      success: true,
      message: `Refund request ${status} successfully.`,
      data: refundRequestWithUserName,
    });
  } catch (error) {
    console.error(`Error updating refund status:`, {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: 'Server error while updating refund status.',
      error: error.message,
    });
  }
};



export const proffAppointmentDisplayByFilter = async (req, res) => {
  try {
    console.log('Received request at:', new Date().toISOString(), 'with query:', req.query);
    const { role, filter } = req.query;
    const currentDate = new Date();

    if (!role || !filter) {
      console.warn('Missing query parameters: role or filter');
      return res.status(400).json({ message: 'Missing required query parameters: role and filter' });
    }

    let dateFilter = {};
    switch (filter) {
      case 'today':
        dateFilter = {
          appointmentDate: {
            $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
            $lt: new Date(currentDate.setHours(23, 59, 59, 999)),
          },
        };
        break;
      case 'week':
        const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
        const endOfWeek = new Date(currentDate.setDate(startOfWeek.getDate() + 6));
        dateFilter = {
          appointmentDate: { $gte: startOfWeek, $lte: endOfWeek },
        };
        break;
      case 'month':
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        dateFilter = {
          appointmentDate: { $gte: startOfMonth, $lte: endOfMonth },
        };
        break;
      default:
        console.warn('Invalid filter value:', filter);
        return res.status(400).json({ message: 'Invalid filter value. Use today, week, or month.' });
    }

    console.log('Applying date filter:', dateFilter);
    const appointments = await ConfirmAppointmentReq.find({
      professionalType: role,
      status: 'confirmed',
      ...dateFilter,
    }).select('doctorId appointmentDate startTime endTime chargePerAppointment specialNotes');
    console.log('Found appointments count:', appointments.length);

    const professionalIds = appointments.map((appointment) => appointment.doctorId);
    console.log('Professional IDs to query:', professionalIds);

    if (professionalIds.length === 0) {
      console.log('No professionals found for the given criteria');
      return res.status(200).json([]);
    }

    const professionals = await Professional.find({ pID: { $in: professionalIds } }).select(
      'pName pID qualification experience profilePicture'
    );
    console.log('Found professionals count:', professionals.length);

    // Combine data, prioritizing ConfirmAppointmentReq fields
    const result = appointments.map((appointment) => {
      const prof = professionals.find((p) => p.pID === appointment.doctorId);
      return {
        pID: appointment.doctorId,
        pName: prof ? prof.pName : 'Unknown',
        qualification: prof ? prof.qualification : 'Not specified',
        experience: prof ? prof.experience : 'Not specified',
        profilePicture: prof ? prof.profilePicture : 'https://via.placeholder.com/300x200',
        chargePerAppointment: appointment.chargePerAppointment || 0,
        specialNotes: appointment.specialNotes || 'No special notes',
        appointmentDate: appointment.appointmentDate ? appointment.appointmentDate.toISOString().split('T')[0] : 'Not specified',
        availableTime: appointment.startTime && appointment.endTime ? `${appointment.startTime} - ${appointment.endTime}` : 'Not specified',
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Error in proffAppointmentDisplayByFilter at:', new Date().toISOString(), error);
    res.status(500).json({ message: 'Error fetching professionals', error: error.message });
  }
};









