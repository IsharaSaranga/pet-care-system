'use client'

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
  const token = localStorage.getItem("petOwnerToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UserRegisteredEventsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [filter, setFilter] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [registrationToCancel, setRegistrationToCancel] = useState(null);
  const token = localStorage.getItem("petOwnerToken");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const response = await api.get("/registrations/user");
        const userRegistrations = response.data?.registrations || [];
        if (!Array.isArray(userRegistrations)) {
          setError("Invalid response from server");
          return;
        }
        setRegistrations(userRegistrations);
        filterRegistrations(userRegistrations, filter);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("petOwnerToken");
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

  const filterRegistrations = (regs, filterType) => {
    const now = new Date("2025-05-14T22:05:00+05:30"); // Current date and time
    let filtered = [];
    if (filterType === "active") {
      filtered = regs.filter(
        (reg) =>
          reg.paymentStatus?.toLowerCase() === "paid" &&
          reg.status?.toLowerCase() === "active" &&
          reg.eventId?._id &&
          new Date(reg.eventId.date) >= now
      );
    } else if (filterType === "past") {
      filtered = regs.filter(
        (reg) =>
          reg.paymentStatus?.toLowerCase() === "paid" &&
          reg.status?.toLowerCase() === "active" &&
          reg.eventId?._id &&
          new Date(reg.eventId.date) < now
      );
    } else if (filterType === "canceled") {
      filtered = regs.filter(
        (reg) =>
          reg.paymentStatus?.toLowerCase() === "paid" &&
          reg.status?.toLowerCase() === "cancelled" &&
          reg.eventId?._id
      );
    }
    setFilteredRegistrations(filtered);
  };

  const handleFilterChange = async (filterType) => {
    setFilter(filterType);
    try {
      const status = filterType === "canceled" ? "cancelled" : "active";
      const response = await api.get(`/registrations/user?status=${status}`);
      const userRegistrations = response.data?.registrations || [];
      setRegistrations(userRegistrations);
      filterRegistrations(userRegistrations, filterType);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching registrations");
    }
  };

  const handleCancel = (registration) => {
    setRegistrationToCancel(registration);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async (reason) => {
    if (!registrationToCancel) return;

    try {
      const response = await api.patch(`/registrations/${registrationToCancel._id}/cancel`, { cancellationReason: reason });
      alert(
        `Registration cancelled successfully. Refund processed: $${response.data.refundAmount.toFixed(2)} (50% of total if cancelled before event date).`
      );
      const updatedRegistrations = registrations.map((reg) =>
        reg._id === registrationToCancel._id ? { ...reg, status: "cancelled" } : reg
      );
      setRegistrations(updatedRegistrations);
      filterRegistrations(updatedRegistrations, filter);
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
      const status = filter === "canceled" ? "cancelled" : "active";
      const response = await api.get(`/registrations/user?status=${status}`);
      const userRegistrations = response.data?.registrations || [];
      setRegistrations(userRegistrations);
      filterRegistrations(userRegistrations, filter);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching registrations");
    }
  };

  const calculateRefundAmount = (registration) => {
    const ticketPrice = registration.eventId?.price || 0;
    const total = ticketPrice * registration.tickets;
    return total * 0.5; // 50% refund
  };

  const handleDownloadReport = () => {
    if (filteredRegistrations.length === 0) {
      alert("No registrations available to download.");
      return;
    }

    const headers = [
      "Event Title",
      "Date",
      "Time",
      "Location",
      "Tickets",
      "Total Cost",
      "Payment Status",
      "Status",
      "Cancellation Reason",
      "Refund Amount",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredRegistrations.map((reg) =>
        [
          `"${reg.eventId?.title || "Event Not Found"}"`,
          `"${reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString() : "N/A"}"`,
          `"${reg.eventId?.time || "N/A"}"`,
          `"${reg.eventId?.location || "Unknown Location"}"`,
          reg.tickets,
          (reg.eventId?.price || 0) * reg.tickets,
          reg.paymentStatus || "N/A",
          reg.status || "N/A",
          `"${reg.status?.toLowerCase() === "cancelled" ? (reg.cancellationReason || "No reason provided") : "N/A"}"`,
          reg.status?.toLowerCase() === "cancelled" ? (reg.refundAmount ? reg.refundAmount.toFixed(2) : "0.00") : "N/A",
        ].join(",")
      ),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `registered_events_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-32 px-6 py-20 text-center bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D08860] mx-auto"></div>
        <p className="text-gray-600 mt-6 text-lg font-medium">Loading your registrations...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">
              Registered Events
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            View your upcoming, past, or canceled event registrations. Each ticket includes one pet (dog or cat) and 1-2 accompanying people.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={() => handleFilterChange("active")}
            className={`px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
              filter === "active"
                ? "bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Active Registrations
          </button>
          <button
            onClick={() => handleFilterChange("past")}
            className={`px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
              filter === "past"
                ? "bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Past Events
          </button>
          <button
            onClick={() => handleFilterChange("canceled")}
            className={`px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
              filter === "canceled"
                ? "bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Canceled Registrations
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-6 py-3 bg-gradient-to-r from-[#26A69A] to-[#00695C] text-white rounded-xl hover:bg-[#004D40] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 inline-block"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download Report
          </button>
          <Link
            to="/events"
            className="flex items-center px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-xl hover:bg-[#80533b] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
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
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-lg mb-8">
            <div className="flex items-center">
              <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="ml-4 text-base text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {!error && filteredRegistrations.length === 0 ? (
          <div className="bg-white/80 rounded-2xl p-10 text-center shadow-lg transform transition hover:scale-105">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-20 w-20 mx-auto text-[#D08860] mb-6 opacity-80"
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
            <p className="text-gray-700 text-xl font-medium mb-4">
              {filter === "active"
                ? "You haven't registered for any upcoming events."
                : filter === "past"
                ? "No past events found."
                : "No canceled registrations found."}
            </p>
            <p className="text-gray-600 text-sm mb-6">
              Discover exciting pet events now! Each ticket is for one pet (dog or cat) and allows 1-2 people to accompany.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-xl hover:bg-[#80533b] transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 duration-300"
            >
              Discover Events
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredRegistrations.map((registration) => (
              <div
                key={registration._id}
                className="bg-white/80 rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex"
              >
                <div
                  className={`flex items-center justify-center w-28 shrink-0 ${
                    registration.status?.toLowerCase() === "active"
                      ? "bg-gradient-to-b from-[#D08860] to-[#B3704D]"
                      : "bg-gradient-to-b from-[#B0BEC5] to-[#78909C]"
                  }`}
                >
                  <div className="text-center text-white">
                    <div className="text-3xl font-bold">
                      {registration.eventId?.date
                        ? new Date(registration.eventId.date).getDate()
                        : "N/A"}
                    </div>
                    <div className="text-sm uppercase">
                      {registration.eventId?.date
                        ? new Date(registration.eventId.date).toLocaleString(
                            "default",
                            { month: "short" }
                          )
                        : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-semibold text-[#B3704D]">
                      {registration.eventId?.title || "Event Not Found"}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-medium ${
                        registration.status?.toLowerCase() === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-[#B0BEC5] text-gray-800"
                      }`}
                    >
                      {registration.status === "active" ? "Active" : "Canceled"}
                    </span>
                  </div>
                  <div className="flex flex-wrap text-sm text-gray-600 mb-4 gap-4">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-[#D08860]"
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
                      <span className="font-medium">
                        {registration.eventId?.location || "Unknown Location"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-[#D08860]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3"
                        />
                      </svg>
                      <span className="font-medium">
                        {registration.eventId?.date
                          ? new Date(registration.eventId.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }) + `, ${registration.eventId.time}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-[#D08860]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 5v2m0 4v2m0 4v2M5 5a2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                        />
                      </svg>
                      <span className="font-medium">
                        {registration.tickets}{" "}
                        {registration.tickets === 1 ? "Ticket" : "Tickets"} (
                        {registration.tickets === 1 ? "1 Pet" : `${registration.tickets} Pets`})
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-[#D08860]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="font-medium">
                        Total: ${(registration.eventId?.price || 0) * registration.tickets}
                      </span>
                    </div>
                  </div>
                  {filter === "active" && (
                    <p className="text-gray-600 text-sm mb-4">
                      Refund Policy: 50% refund if canceled before event date (
                      ${calculateRefundAmount(registration).toFixed(2)}).
                    </p>
                  )}
                  {filter === "canceled" && (
                    <p className="text-gray-600 text-sm mb-4">
                      Canceled: {registration.cancellationReason || "No reason provided"} | Refunded: $
                      {registration.refundAmount ? registration.refundAmount.toFixed(2) : "0.00"}
                    </p>
                  )}
                  {filter === "active" && (
                    <div className="flex flex-wrap items-center gap-3">
                      <Link
                        to={`/event/${registration.eventId?._id || ""}`}
                        className="flex items-center bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white px-4 py-2 rounded-xl hover:bg-[#80533b] transition-colors shadow-sm hover:shadow-md transform hover:scale-105 duration-300"
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
                        onClick={() => handleCancel(registration)}
                        disabled={
                          !registration.eventId?.date ||
                          new Date(registration.eventId.date) < new Date("2025-05-14T22:05:00+05:30")
                        }
                        className={`flex items-center px-4 py-2 rounded-xl text-white transition-colors shadow-sm hover:shadow-md transform hover:scale-105 duration-300 ${
                          !registration.eventId?.date ||
                          new Date(registration.eventId.date) < new Date("2025-05-14T22:05:00+05:30")
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        Cancel Registration
                      </button>
                      <button
                        onClick={() => handleUpdateTickets(registration)}
                        className="flex items-center bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white px-4 py-2 rounded-xl hover:bg-[#80533b] transition-colors shadow-sm hover:shadow-md transform hover:scale-105 duration-300"
                      >
                        Update Tickets
                      </button>
                    </div>
                  )}
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
            registration={registrationToCancel}
            onConfirm={handleCancelConfirm}
            onClose={() => {
              setCancelModalOpen(false);
              setRegistrationToCancel(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default UserRegisteredEventsPage;