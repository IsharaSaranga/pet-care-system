export const validateAppointment = (req, res, next) => {
  // List of required fields from req.body (excluding userId)
  const requiredFields = [
    "doctorId",
    "appointmentDate",
    "appointmentTime",
    "userName",
    "phoneNo",
    "email",
    "appointmentType",
    "appointmentFee",
  ];

  // Check for missing fields
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
      missingFields,
    });
  }

  next();
};