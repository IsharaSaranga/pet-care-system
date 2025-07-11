import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

// Custom Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm animate-slide-in-from-right ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-amber-200 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-from-right {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default function DoctorAvlCreateTable() {
  const [formData, setFormData] = useState({
    doctorId: "",
    appointmentDate: "",
    startTime: "",
    endTime: "",
    specialNotes: "",
    chargePerAppointment: "",
    professionalType: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("profToken");

  // Show notification with message and type
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
  };

  // Hide notification
  const hideNotification = () => {
    setNotification({ show: false, message: "", type: "success" });
  };

  useEffect(() => {
    if (!token) {
      console.log("No profToken found, redirecting to login");
      showNotification("No authentication token found. Please log in.", "error");
      setTimeout(() => navigate("/professional/login"), 3000);
      return;
    }
    try {
      const decoded = jwtDecode(token);
      console.log("Decoded token:", decoded);
      if (decoded.exp * 1000 < Date.now()) {
        console.log("Token expired, redirecting to login");
        showNotification("Session expired. Please log in again.", "error");
        localStorage.removeItem("profToken");
        localStorage.removeItem("profRole");
        setTimeout(() => navigate("/professional/login"), 3000);
        return;
      }
      const role = decoded.role || decoded.type;
      if (!["vet", "groomer", "pet-trainer"].includes(role)) {
        console.log("Unauthorized role:", role);
        showNotification(
          "Unauthorized role. Please log in with a valid professional account.",
          "error"
        );
        setTimeout(() => navigate("/professional/dashboard"), 3000);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        doctorId: decoded.pID || decoded.id || "",
        professionalType: role,
      }));
    } catch (error) {
      console.error("Invalid token:", error);
      showNotification("Invalid token. Please log in again.", "error");
      localStorage.removeItem("profToken");
      localStorage.removeItem("profRole");
      setTimeout(() => navigate("/professional/login"), 3000);
    }
    setIsLoading(false);
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.startTime >= formData.endTime) {
      showNotification("Start time must be before end time.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      if (!token) {
        console.log("No profToken found in submit, redirecting to login");
        showNotification("No authentication token found. Please log in.", "error");
        setTimeout(() => navigate("/professional/login"), 3000);
        return;
      }
      const decoded = jwtDecode(token);
      console.log("Decoded token in submit:", decoded);
      if (decoded.exp * 1000 < Date.now()) {
        console.log("Token expired in submit, redirecting to login");
        showNotification("Session expired. Please log in again.", "error");
        localStorage.removeItem("profToken");
        localStorage.removeItem("profRole");
        setTimeout(() => navigate("/professional/login"), 3000);
        return;
      }
      const role = decoded.role || decoded.type;
      if (!["vet", "groomer", "pet-trainer"].includes(role)) {
        console.log("Unauthorized role in submit:", role);
        showNotification(
          "Unauthorized role. Please log in with a valid professional account.",
          "error"
        );
        setTimeout(() => navigate("/professional/dashboard"), 3000);
        return;
      }
      const submissionData = {
        ...formData,
        professionalId: formData.doctorId,
        professionalType: role,
        chargePerAppointment: Number(formData.chargePerAppointment),
      };
      console.log("Submission data:", submissionData);
      const response = await axios.post(
        "http://localhost:5000/api/appointments/ReqAvlTemp",
        submissionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Availability request saved:", response.data);
      setFormData((prev) => ({
        ...prev,
        appointmentDate: "",
        startTime: "",
        endTime: "",
        specialNotes: "",
        chargePerAppointment: "",
        professionalType: role,
      }));
      showNotification("Availability request saved successfully!", "success");
    } catch (error) {
      console.error(
        "Error saving availability request:",
        error.response?.data,
        error.response?.status
      );
      if (error.response?.status === 401) {
        localStorage.removeItem("profToken");
        localStorage.removeItem("profRole");
        showNotification("Session expired. Please log in again.", "error");
        setTimeout(() => navigate("/professional/login"), 3000);
      }
      showNotification(
        error.response?.data?.error || "Failed to save availability request",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    console.log("Logging out, clearing profToken");
    localStorage.removeItem("profToken");
    localStorage.removeItem("profRole");
    navigate("/professional/redirect/login");
  };

  if (isLoading) {
    return (
      <div className="text-center text-amber-950 text-lg font-medium animate-pulse">
        Loading...
      </div>
    );
  }

  const roleDisplayNames = {
    vet: "Veterinarian",
    groomer: "Groomer",
    "pet-trainer": "Pet Trainer",
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] p-8">
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-10 w-full max-w-2xl animate-slide-in"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="space-y-10">
          <div className="border-b border-amber-200 pb-6">
            <h2 className="text-2xl font-bold text-amber-950 tracking-tight">
              Create Availability Request
            </h2>
            <p className="mt-2 text-sm text-amber-700">
              Provide your availability details for clients to book appointments.
            </p>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-amber-800 hover:text-amber-900 mt-4 transition-colors duration-200"
            >
              Logout
            </button>
            <div className="mt-8 grid grid-cols-1 gap-y-6">
              <div className="animate-slide-in" style={{ animationDelay: "0.2s" }}>
                <label
                  htmlFor="doctor-id"
                  className="block text-sm font-medium text-amber-950"
                >
                  Professional ID
                </label>
                <input
                  id="doctor-id"
                  name="doctorId"
                  type="text"
                  value={formData.doctorId}
                  readOnly
                  className="mt-2 block w-full rounded-lg border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm sm:text-sm cursor-not-allowed focus:ring-0 focus:border-amber-200"
                />
              </div>
              <div className="animate-slide-in" style={{ animationDelay: "0.3s" }}>
                <label
                  htmlFor="professional-type"
                  className="block text-sm font-medium text-amber-950"
                >
                  Professional Type
                </label>
                <select
                  id="professional-type"
                  name="professionalType"
                  value={formData.professionalType}
                  onChange={handleInputChange}
                  required
                  disabled
                  className="mt-2 block w-full rounded-lg border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm sm:text-sm cursor-not-allowed focus:ring-0 focus:border-amber-200"
                >
                  <option value={formData.professionalType}>
                    {roleDisplayNames[formData.professionalType]}
                  </option>
                </select>
              </div>
              <div className="animate-slide-in" style={{ animationDelay: "0.4s" }}>
                <label
                  htmlFor="appointment-date"
                  className="block text-sm font-medium text-amber-950"
                >
                  Availability Date
                </label>
                <input
                  id="appointment-date"
                  name="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="mt-2 block w-full rounded-lg border-amber-200 bg-white px-4 py-3 text-amber-950 shadow-sm focus:border-amber-400 focus:ring-amber-400 sm:text-sm transition-all duration-300 hover:shadow-md"
                />
              </div>
              <div className="animate-slide-in" style={{ animationDelay: "0.5s" }}>
                <label
                  htmlFor="start-time"
                  className="block text-sm font-medium text-amber-950"
                >
                  Start Time
                </label>
                <input
                  id="start-time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full rounded-lg border-amber-200 bg-white px-4 py-3 text-amber-950 shadow-sm focus:border-amber-400 focus:ring-amber-400 sm:text-sm transition-all duration-300 hover:shadow-md"
                />
              </div>
              <div className="animate-slide-in" style={{ animationDelay: "0.6s" }}>
                <label
                  htmlFor="end-time"
                  className="block text-sm font-medium text-amber-950"
                >
                  End Time
                </label>
                <input
                  id="end-time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full rounded-lg border-amber-200 bg-white px-4 py-3 text-amber-950 shadow-sm focus:border-amber-400 focus:ring-amber-400 sm:text-sm transition-all duration-300 hover:shadow-md"
                />
              </div>
              <div className="animate-slide-in" style={{ animationDelay: "0.7s" }}>
                <label
                  htmlFor="charge-per-appointment"
                  className="block text-sm font-medium text-amber-950"
                >
                  Charge Per Appointment ($)
                </label>
                <input
                  id="charge-per-appointment"
                  name="chargePerAppointment"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.chargePerAppointment}
                  onChange={handleInputChange}
                  placeholder="Enter appointment charge"
                  required
                  className="mt-2 block w-full rounded-lg border-amber-200 bg-white px-4 py-3 text-amber-950 shadow-sm focus:border-amber-400 focus:ring-amber-400 sm:text-sm transition-all duration-300 hover:shadow-md placeholder-amber-400"
                />
              </div>
              <div className="animate-slide-in" style={{ animationDelay: "0.8s" }}>
                <label
                  htmlFor="special-notes"
                  className="block text-sm font-medium text-amber-950"
                >
                  Special Notes
                </label>
                <textarea
                  id="special-notes"
                  name="specialNotes"
                  rows={4}
                  value={formData.specialNotes}
                  onChange={handleInputChange}
                  className="mt-2 block w-full rounded-lg border-amber-200 bg-white px-4 py-3 text-amber-950 shadow-sm focus:border-amber-400 focus:ring-amber-400 sm:text-sm transition-all duration-300 hover:shadow-md placeholder-amber-400"
                  placeholder="Enter any special notes (optional)"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-8 bg-amber-50 rounded-lg p-6 animate-slide-in"
          style={{ animationDelay: "0.9s" }}
        >
          <h3 className="text-lg font-semibold text-amber-950">
            How to Fill Out This Form
          </h3>
          <ul className="mt-2 space-y-2 text-sm text-amber-700">
            <li>
              <span className="font-medium">Professional ID & Type:</span> These
              are auto-filled based on your account and cannot be changed.
            </li>
            <li>
              <span className="font-medium">Availability Date:</span> Select a
              future date when you are available for appointments.
            </li>
            <li>
              <span className="font-medium">Start & End Time:</span> Specify the
              time range for your availability. Ensure the start time is before
              the end time.
            </li>
            <li>
              <span className="font-medium">Charge Per Appointment:</span> Enter
              the cost for each appointment in dollars (e.g., 50.00).
            </li>
            <li>
              <span className="font-medium">Special Notes:</span> Add any relevant
              information, such as specific services or requirements (optional).
            </li>
            <li>
              <span className="font-medium">Save or Cancel:</span> Click "Save
              Availability" to submit or "Cancel" to clear the form.
            </li>
          </ul>
        </div>

        <div
          className="mt-8 flex justify-end gap-x-4 animate-slide-in"
          style={{ animationDelay: "1s" }}
        >
          <button
            type="button"
            className="text-sm font-semibold text-amber-800 hover:text-amber-900 transition-colors duration-200"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                appointmentDate: "",
                startTime: "",
                endTime: "",
                specialNotes: "",
                chargePerAppointment: "",
                professionalType: formData.professionalType,
              }))
            }
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-amber-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isSubmitting ? "Saving..." : "Save Availability"}
          </button>
        </div>

        <style jsx>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-in {
            animation: slideIn 0.6s ease-out forwards;
          }
        `}</style>
      </form>
    </div>
  );
}