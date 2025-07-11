import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import UpdateTicketsModal from "../Component/UpdateTicketsModal";
import CancelRegistrationModal from "../Component/CancelRegistrationModal";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const UserRegisteredEventsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [registrationToCancel, setRegistrationToCancel] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await api.get("/registrations/user");
        console.log("API Response:", response.data);
        const userRegistrations = response.data?.registrations || [];
        if (!Array.isArray(userRegistrations)) {
          console.error("Invalid registrations format:", userRegistrations);
          setError("Invalid response from server");
          return;
        }
        const activeRegistrations = userRegistrations.filter(
          (reg) =>
            reg.paymentStatus?.toLowerCase() === "paid" &&
            reg.status?.toLowerCase() === "active" &&
            reg.eventId?._id
        );
        console.log("Filtered Registrations:", activeRegistrations);
        const filteredOut = userRegistrations.filter(
          (reg) =>
            reg.paymentStatus?.toLowerCase() !== "paid" ||
            reg.status?.toLowerCase() !== "active" ||
            !reg.eventId?._id
        );
        console.log("Filtered Out Registrations:", filteredOut);
        setRegistrations(activeRegistrations);
      } catch (err) {
        console.error("Fetch Error:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          setError("Session expired. Please log in again.");
        } else {
          setError(err.response?.data?.message || "Error fetching registrations");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRegistrations();
    } else {
      setError("Please log in to view your registrations.");
      setLoading(false);
    }
  }, [token, navigate]);

  const handleCancel = (registrationId) => {
    const registration = registrations.find((reg) => reg._id === registrationId);
    setRegistrationToCancel(registration);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async (reason) => {
    if (!registrationToCancel) return;

    try {
      const response = await api.patch(`/registrations/${registrationToCancel._id}/cancel`, { cancellationReason: reason });
      alert(
        `Registration cancelled. Refund: $${response.data.refundAmount.toFixed(2)}`
      );
      setRegistrations(
        registrations.filter((reg) => reg._id !== registrationToCancel._id)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelModalOpen(false);
      setRegistrationToCancel(null);
    }
  };

  const handleUpdateTickets = (registration) => {
    setSelectedRegistration(registration);
    setModalOpen(true);
  };

  const fetchRegistrations = async () => {
    try {
      const response = await api.get("/registrations/user");
      const userRegistrations = response.data?.registrations || [];
      const activeRegistrations = userRegistrations.filter(
        (reg) =>
          reg.paymentStatus?.toLowerCase() === "paid" &&
          reg.status?.toLowerCase() === "active" &&
          reg.eventId?._id
      );
      setRegistrations(activeRegistrations);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching registrations");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-28 p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        <span className="ml-4 text-amber-900">Loading your registrations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-28 p-6">
      <div className="flex justify-between items-center mb-8 border-b border-amber-200 pb-4">
        <h1 className="text-3xl font-bold text-amber-900">My Registered Events</h1>
        <Link
          to="/events"
          className="flex items-center px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-all border border-amber-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Browse More Events
        </Link>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!error && registrations.length === 0 ? (
        <div className="bg-amber-50 rounded-lg p-8 text-center shadow-sm border border-amber-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto text-amber-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-700 text-lg mb-6">
            You haven't registered for any events yet.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Discover Events
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {registrations.map((registration) => (
            <div
              key={registration._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="md:flex">
                <div className="md:flex-shrink-0 bg-amber-700 flex items-center justify-center w-full md:w-24 h-24 md:h-auto">
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold">
                      {registration.eventId?.date
                        ? new Date(registration.eventId.date).getDate()
                        : "N/A"}
                    </div>
                    <div className="text-sm">
                      {registration.eventId?.date
                        ? new Date(registration.eventId.date).toLocaleString(
                            "default",
                            { month: "short" }
                          )
                        : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="p-6 md:flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {registration.eventId?.title || "Event Not Found"}
                  </h2>
                  <div className="flex flex-wrap text-sm text-gray-600 mb-4">
                    <div className="flex items-center mr-4 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 text-amber-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {registration.eventId?.location || "Unknown Location"}
                    </div>
                    <div className="flex items-center mr-4 mb-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1 text-amber-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                      {registration.tickets}{" "}
                      {registration.tickets === 1 ? "Ticket" : "Tickets"}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      to={`/event/${registration.eventId?._id || ""}`}
                      className="flex items-center bg-amber-700 text-white px-3 py-1 rounded hover:bg-amber-800 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      View Details
                    </Link>
                    <button
                      onClick={() => handleCancel(registration._id)}
                      disabled={
                        !registration.eventId?.date ||
                        new Date(registration.eventId.date) < new Date()
                      }
                      className={`flex items-center px-3 py-1 rounded text-white transition-colors ${
                        !registration.eventId?.date ||
                        new Date(registration.eventId.date) < new Date()
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      Cancel Registration
                    </button>
                    <button
                      onClick={() => handleUpdateTickets(registration)}
                      className="flex items-center bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition-colors"
                    >
                      Update Tickets
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && selectedRegistration && (
        <UpdateTicketsModal
          registration={selectedRegistration}
          onConfirm={() => {
            setModalOpen(false);
            setSelectedRegistration(null);
            fetchRegistrations();
          }}
          onClose={() => {
            setModalOpen(false);
            setSelectedRegistration(null);
          }}
        />
      )}

      {cancelModalOpen && registrationToCancel && (
        <CancelRegistrationModal
          onConfirm={handleCancelConfirm}
          onClose={() => {
            setCancelModalOpen(false);
            setRegistrationToCancel(null);
          }}
        />
      )}
    </div>
  );
};

export default UserRegisteredEventsPage;