'use client'

import { useState } from "react";
import axios from "axios";
import { FaPaw, FaInfoCircle } from "react-icons/fa";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("petOwnerToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const UpdateTicketsModal = ({ registration, onConfirm, onClose }) => {
  const [tickets, setTickets] = useState(registration.tickets);
  const [error, setError] = useState(null);
  const availableTickets =
    registration.eventId.maxAttendees - registration.eventId.registeredTickets + registration.tickets;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tickets < 1 || tickets > availableTickets) {
      setError("Invalid ticket count");
      return;
    }
    if (tickets === registration.tickets) {
      setError("No change in ticket count");
      return;
    }
    try {
      const response = await api.patch(
        `/registrations/${registration._id}/update-tickets`,
        { newTickets: tickets }
      );
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        alert(
          `Tickets updated to ${tickets}. Refund: $${response.data.refundAmount.toFixed(2)}`
        );
        onConfirm();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update tickets");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-lg flex items-center justify-center z-50 px-4">
      <div className="bg-white/90 rounded-2xl p-8 w-full max-w-lg shadow-xl transform transition-all">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">
            Update Tickets for {registration.eventId.title}
          </span>
        </h2>

        {/* Ticket Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#B3704D] mb-3 flex items-center gap-2">
            <FaInfoCircle size={20} /> Ticket Details
          </h3>
          <div className="space-y-2 text-gray-700 mb-4">
            <p>
              <span className="font-semibold">Price per Ticket:</span>{" "}
              <span className="text-[#B3704D]">${registration.eventId.price.toFixed(2)}</span>
            </p>
            <p>
              <span className="font-semibold">Available Tickets:</span>{" "}
              <span className="text-[#B3704D]">{availableTickets}</span>
            </p>
            <p>
              <span className="font-semibold">Current Tickets:</span>{" "}
              <span className="text-[#B3704D]">{registration.tickets}</span>
            </p>
            <p>
              <span className="font-semibold">Total Cost:</span>{" "}
              <span className="text-[#B3704D]">${(registration.eventId.price * tickets).toFixed(2)}</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Tickets
            </label>
            <input
              type="number"
              min="1"
              max={availableTickets}
              value={tickets}
              onChange={(e) => setTickets(parseInt(e.target.value) || 1)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#D08860] focus:border-transparent shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-5 rounded-xl shadow-sm mb-6">
          <h3 className="text-lg font-semibold text-[#B3704D] flex items-center gap-2 mb-3">
            <FaPaw size={20} /> Important Notes
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>
              Each ticket is for <span className="font-semibold">one pet</span> (dog or cat) and
              allows <span className="font-semibold">1-2 people</span> to accompany.
            </li>
            <li>
              Ensure your pet is a dog or cat, and bring supplies (e.g., leash, water bowl) for their
              comfort.
            </li>
            <li>
              You will receive an updated confirmation email with event details after submission.
            </li>
          </ul>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 bg-red-50 px-4 py-2 rounded-xl mb-6 text-sm text-center">
            {error}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors shadow-sm hover:shadow-md transform hover:scale-105 duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={tickets < 1 || tickets > availableTickets}
            className={`px-6 py-3 rounded-xl text-white font-medium transition-all shadow-sm hover:shadow-md transform hover:scale-105 duration-300 flex items-center gap-2 ${
              tickets < 1 || tickets > availableTickets
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#D08860] to-[#B3704D] hover:bg-[#80533b]"
            }`}
          >
            Confirm Update
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateTicketsModal;