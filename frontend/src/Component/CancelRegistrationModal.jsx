import React, { useState } from "react";

const CancelRegistrationModal = ({ registration, onConfirm, onClose }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }
    onConfirm(reason);
  };

  const calculateRefundAmount = () => {
    const ticketPrice = registration.eventId?.price || 0;
    const total = ticketPrice * registration.tickets;
    return total * 0.5; // 50% refund
  };

  return (
    <div className="fixed inset-0 bg-gray-800/30 backdrop-blur-lg flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-[#B3704D] mb-4">Cancel Registration</h2>
        <p className="text-gray-600 mb-2">
          Event: <span className="font-medium">{registration.eventId?.title || "Unknown Event"}</span>
        </p>
        <p className="text-gray-600 mb-2">
          Date: <span className="font-medium">
            {registration.eventId?.date
              ? new Date(registration.eventId.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }) + `, ${registration.eventId.time}`
              : "N/A"}
          </span>
        </p>
        <p className="text-gray-600 mb-2">
          Tickets: <span className="font-medium">{registration.tickets}</span>
        </p>
        <p className="text-gray-600 mb-2">
          Total Paid: <span className="font-medium">${(registration.eventId?.price || 0) * registration.tickets}</span>
        </p>
        <p className="text-gray-600 mb-4">
          Refund Amount: <span className="font-medium text-[#D08860]">${calculateRefundAmount().toFixed(2)}</span> (50% of total if cancelled before event date)
        </p>
        <p className="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] bg-gray-50"
          rows="4"
          placeholder="Enter your reason here..."
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Confirm Cancellation
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelRegistrationModal;