// src/pages/Success.js
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("petOwnerToken"); // Changed from "token"
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Processing Payment...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const appointmentId = searchParams.get("appointment_id");
    const registrationId = searchParams.get("registration_id");
    const eventId = searchParams.get("event_id");

    console.log("Success Page - Session ID:", sessionId);
    console.log("Success Page - Appointment ID:", appointmentId);
    console.log("Success Page - Registration ID:", registrationId);
    console.log("Success Page - Event ID:", eventId);
    console.log("Success Page - Token:", localStorage.getItem("petOwnerToken"));
    const confirmPayment = async (retries = 5, delay = 2000) => {
      if (!localStorage.getItem("petOwnerToken")) {
        setMessage("You are not logged in. Please log in to confirm your payment.");
        setIsError(true);
        setTimeout(() => navigate("/login"), 3000);
        return;
      }

      if (!sessionId || (!appointmentId && !registrationId)) {
        setMessage("Missing payment information. Please contact support.");
        setIsError(true);
        setTimeout(() => navigate("/events"), 3000);
        return;
      }

      for (let i = 0; i < retries; i++) {
        try {
          console.log(`Attempt ${i + 1} - Requesting confirmation with params:`, {
            sessionId,
            appointmentId,
            registrationId,
          });

          let response;
          if (appointmentId) {
            response = await api.get(`/appointments/confirm`, {
              params: { sessionId, appointmentId },
            });
          } else if (registrationId) {
            // Check if this is an update or initial registration
            const isUpdate = searchParams.get("update") === "true"; // Optional: Add query param in backend
            if (isUpdate) {
              response = await api.post(
                `/registrations/confirm-update`,
                {},
                {
                  params: { sessionId, registrationId },
                }
              );
            } else {
              response = await api.post(
                `/registrations/confirm`,
                {},
                {
                  params: { sessionId, registrationId },
                }
              );
            }
          }

          console.log("Confirmation Response:", response.data);
          if (response.data.success) {
            setMessage(
              appointmentId
                ? "Appointment Booked and Paid Successfully!"
                : registrationId && searchParams.get("update") === "true"
                ? `Tickets Updated Successfully!`
                : "Event Registration Confirmed Successfully!"
            );
            setTimeout(() => {
              navigate(appointmentId ? "/profile" : `/my-events`, {
                replace: true,
              });
            }, 3000);
            return;
          }
        } catch (error) {
          console.error(`Attempt ${i + 1} - Error:`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });

          if (i === retries - 1) {
            const errorMessage = error.response?.data?.message || "Unknown error";
            setMessage(
              `Payment confirmation failed: ${errorMessage}. Please check your ${
                appointmentId ? "appointments" : "registrations"
              } or contact support.`
            );
            setIsError(true);
            setTimeout(() => {
              navigate(appointmentId ? "/appointments" : `/my-events`, {
                replace: true,
              });
            }, 3000);
          }
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    confirmPayment();
  }, [searchParams, navigate]);

  return (
    <div className="max-w-6xl mx-auto p-8 pt-24 text-center">
      <h1
        className={`text-3xl font-bold ${
          isError ? "text-red-600" : "text-[#D08860]"
        }`}
      >
        {message}
      </h1>
      {!isError && (
        <>
          <p className="mt-4 text-lg">Please wait while we confirm your payment.</p>
          <div className="mt-8 animate-pulse">
            <div className="w-16 h-16 border-4 border-[#D08860] border-t-transparent rounded-full mx-auto animate-spin"></div>
          </div>
        </>
      )}
      {isError && (
        <div className="mt-4">
          <button
            onClick={() => navigate("/events")}
            className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
          >
            Back to Events
          </button>
        </div>
      )}
    </div>
  );
};

export default Success;