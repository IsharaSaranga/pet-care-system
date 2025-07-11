import { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaPhone, FaEnvelope, FaPaw, FaCalendar, FaClock, FaDollarSign } from "react-icons/fa";

// Axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("petOwnerToken"); // Changed from "token"
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AppointmentForm = ({ professional, onClose, appointmentType, appointmentFee }) => {
  const [formData, setFormData] = useState({
    doctorId: professional?.id || "",
    appointmentDate: "",
    appointmentTime: "",
    userName: "",
    phoneNo: "",
    email: "",
    appointmentType: "",
    appointmentFee: appointmentFee || "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map activeSection values to backend-compatible appointmentType values
  const mapAppointmentType = (type) => {
    const typeMap = {
      vet: "veterinarian",
      groomer: "groomer",
      "pet-trainer": "trainer",
    };
    return typeMap[type.toLowerCase()] || "";
  };

  useEffect(() => {
    const mappedType = mapAppointmentType(appointmentType);
    setFormData((prev) => ({
      ...prev,
      doctorId: professional?.id || "",
      appointmentType: mappedType,
      appointmentFee: appointmentFee || "",
    }));
  }, [professional, appointmentType, appointmentFee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^[0-9]{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.doctorId) errors.doctorId = "Professional ID is required";
    if (!formData.userName.trim()) errors.userName = "Full name is required";
    if (!phoneRegex.test(formData.phoneNo)) errors.phoneNo = "Phone number must be 10 digits";
    if (!emailRegex.test(formData.email)) errors.email = "Invalid email format";
    if (!formData.appointmentDate || new Date(formData.appointmentDate) < new Date().setHours(0, 0, 0, 0)) {
      errors.appointmentDate = "Appointment date must be today or in the future";
    }
    if (!formData.appointmentTime) errors.appointmentTime = "Appointment time is required";
    if (!formData.appointmentType) errors.appointmentType = "Appointment type is required";
    if (isNaN(formData.appointmentFee) || Number(formData.appointmentFee) <= 0) {
      errors.appointmentFee = "Appointment fee must be a positive number";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post("/appointments/create", {
        doctorId: formData.doctorId,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        userName: formData.userName,
        phoneNo: formData.phoneNo,
        email: formData.email,
        appointmentType: formData.appointmentType,
        appointmentFee: Number(formData.appointmentFee),
      });

      if (response.data.success) {
        window.location.href = response.data.checkoutUrl; // Redirect to Stripe Checkout
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      let errorMessage = "Failed to initiate payment. Please try again.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      alert(errorMessage);
      setIsSubmitting(false);
    }
  };

  const renderInputField = (name, label, type, icon, options = null, readOnly = false) => {
    const IconComponent = icon;
    const inputClass = `w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent transition duration-200 ${
      readOnly ? "bg-gray-100 text-gray-600" : ""
    }`;

    if (options) {
      return (
        <div className="mb-6">
          <label className="block font-medium mb-2 flex items-center text-gray-700">
            {IconComponent && <IconComponent className="mr-2 text-[#D08860]" size={18} />}
            {label}
          </label>
          <div className="relative">
            <select
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className={`${inputClass} appearance-none`}
              disabled={readOnly}
            >
              <option value="">Select {label}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          {formErrors[name] && <p className="text-red-500 text-sm mt-1">{formErrors[name]}</p>}
        </div>
      );
    }

    return (
      <div className="mb-6">
        <label className="block font-medium mb-2 flex items-center text-gray-700">
          {IconComponent && <IconComponent className="mr-2 text-[#D08860]" size={18} />}
          {label}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={inputClass}
            readOnly={readOnly}
            placeholder={`Enter ${label}`}
          />
        </div>
        {formErrors[name] && <p className="text-red-500 text-sm mt-1">{formErrors[name]}</p>}
      </div>
    );
  };

  const appointmentTypeOptions = [
    { value: "veterinarian", label: "Veterinarian" },
    { value: "groomer", label: "Groomer" },
    { value: "trainer", label: "Trainer" },
  ];

  return (
    <div className="max-w-xl mx-auto p-8 shadow-xl rounded-xl bg-white mt-8 border border-gray-100">
      <div className="text-center mb-8">
        <div className="inline-block p-3 rounded-full bg-[#D08860] bg-opacity-10 mb-4">
          <FaCalendar className="text-[#D08860]" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-[#D08860]">
          Book an Appointment
        </h2>
        <p className="text-gray-600 mt-1">with {professional?.name}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>{renderInputField("doctorId", "Professional ID", "text", FaUser, null, true)}</div>
          <div>{renderInputField("appointmentType", "Appointment Type", "select", FaPaw, appointmentTypeOptions, !!appointmentType)}</div>
        </div>
        
        <div>{renderInputField("appointmentFee", "Appointment Fee ($)", "number", FaDollarSign, null, true)}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>{renderInputField("userName", "Full Name", "text", FaUser)}</div>
          <div>{renderInputField("phoneNo", "Phone Number", "tel", FaPhone)}</div>
        </div>
        
        <div>{renderInputField("email", "Email Address", "email", FaEnvelope)}</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>{renderInputField("appointmentDate", "Appointment Date", "date", FaCalendar)}</div>
          <div>{renderInputField("appointmentTime", "Appointment Time", "time", FaClock)}</div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all duration-300 shadow-sm"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-3 bg-[#D08860] text-white rounded-lg hover:bg-[#B3714E] transition-all duration-300 shadow-sm flex items-center ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : (
              <>
                Proceed to Payment
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;