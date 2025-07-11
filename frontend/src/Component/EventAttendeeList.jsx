import React, { useState } from "react";
import { FiRefreshCw, FiMail, FiCopy } from "react-icons/fi";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

const AttendeeList = ({ eventId, attendees, onRefresh, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ticketFilter, setTicketFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [emailFeedback, setEmailFeedback] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailDetails, setEmailDetails] = useState({ to: "", subject: "", body: "" });

  const today = new Date("2025-05-14");

  const filteredAttendees = attendees.filter((attendee) => {
    const matchesSearch =
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      attendee.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesTicket =
      ticketFilter === "all" ||
      (ticketFilter === "1" && attendee.tickets === 1) ||
      (ticketFilter === "2+" && attendee.tickets >= 2);
    const registrationDate = new Date(attendee.registeredAt);
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "last7" && (today - registrationDate) / (1000 * 60 * 60 * 24) <= 7) ||
      (dateFilter === "last30" && (today - registrationDate) / (1000 * 60 * 60 * 24) <= 30);
    return matchesSearch && matchesStatus && matchesTicket && matchesDate;
  });

  const handleSendEmail = (email, name) => {
    setEmailFeedback(null);

    if (window.confirm(`Simulate sending an email to ${email}? (Test mode)`)) {
      const subject = `Regarding Event Registration (${eventId})`;
      const body = `Dear ${name},\n\nWe are reaching out regarding your registration for the event. Please let us know how we can assist you.\n\nBest regards,\n[Your Event Team]`;
      
      setEmailDetails({ to: email, subject, body });
      setIsEmailModalOpen(true);
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email).then(() => {
      setEmailFeedback(`Copied ${email} to clipboard!`);
    }).catch((error) => {
      console.error("Error copying email:", error);
      setEmailFeedback("Failed to copy email to clipboard.");
    });
  };

  const closeEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmailDetails({ to: "", subject: "", body: "" });
  };

  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-amber-100 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Registered Attendees</h3>
          <p className="text-gray-600 text-base">{attendees.length} total registrations</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Search attendees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base pl-10"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={ticketFilter}
            onChange={(e) => setTicketFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base"
          >
            <option value="all">All Tickets</option>
            <option value="1">1 Ticket</option>
            <option value="2+">2+ Tickets</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base"
          >
            <option value="all">All Dates</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
          </select>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-amber-800 hover:text-amber-900 disabled:opacity-50 transform hover:scale-105 transition duration-300"
            title="Refresh attendees"
          >
            <FiRefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {emailFeedback && (
        <div className="mb-4 p-3 bg-amber-50 text-amber-800 rounded-xl text-base border border-amber-200">
          {emailFeedback}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700"></div>
          <p className="mt-2 text-gray-600 text-base">Loading attendees...</p>
        </div>
      ) : filteredAttendees.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttendees.map((attendee) => (
            <div
              key={attendee._id}
              className="bg-gray-50 p-4 rounded-xl border-l-4 border-[#D08860] hover:shadow-md transition-all duration-300 relative"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-full flex items-center justify-center font-bold">
                  {attendee.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800 text-base">{attendee.name}</p>
                  <p className="text-sm text-gray-600 break-words">{attendee.email}</p>
                  <div className="flex flex-col space-y-1 mt-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>
                        {new Date(attendee.registeredAt).toLocaleDateString()} •{" "}
                        {attendee.tickets} ticket{attendee.tickets !== 1 ? "s" : ""}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 font-semibold rounded-full text-xs ${
                          attendee.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {attendee.status}
                      </span>
                    </div>
                    {attendee.status === "cancelled" && (
                      <div className="text-sm text-gray-500 mt-1 space-y-1">
                        <p>
                          Cancelled: {new Date(attendee.cancelledAt).toLocaleDateString()}
                        </p>
                        <p>
                          Refund: {attendee.refundAmount.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </p>
                        {attendee.cancellationReason && (
                          <p title={attendee.cancellationReason}>
                            Reason: {attendee.cancellationReason.length > 20
                              ? `${attendee.cancellationReason.slice(0, 20)}...`
                              : attendee.cancellationReason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={() => handleSendEmail(attendee.email, attendee.name)}
                  className="text-gray-500 hover:text-amber-800 p-1 transform hover:scale-110 transition duration-300"
                  title="Simulate email (test mode)"
                >
                  <FiMail className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleCopyEmail(attendee.email)}
                  className="text-gray-500 hover:text-amber-800 p-1 transform hover:scale-110 transition duration-300"
                  title="Copy email to clipboard"
                >
                  <FiCopy className="h-5 w-5" />
                </button>
                {attendee.cancellationReason && (
                  <button
                    className="text-gray-500 hover:text-amber-800 p-1 transform hover:scale-110 transition duration-300"
                    title={attendee.cancellationReason}
                  >
                    <FaInfoCircle className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.768-.231-1.47-.62-2.062M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.768.231-1.47.62-2.062M14 14h2.62M5.625 14h2.62m0 0a2.96 2.96 0 00.62 2.062M5.625 14H4a1 1 0 00-.707.293l-2 2a1 1 0 000 1.414l2 2a1 1 0 00.707.293h15a1 1 0 00.707-.293l2-2a1 1 0 000-1.414l-2-2a1 1 0 00-.707-.293H14zm0 0V10a2 2 0 10-4 0v4m0 0a2 2 0 104 0z"
            />
          </svg>
          <p className="text-gray-600 text-base">
            {searchTerm || statusFilter !== "all" || ticketFilter !== "all" || dateFilter !== "all"
              ? "No matching attendees found"
              : "No users registered yet"}
          </p>
          {(searchTerm || statusFilter !== "all" || ticketFilter !== "all" || dateFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setTicketFilter("all");
                setDateFilter("all");
              }}
              className="mt-2 text-amber-800 hover:text-amber-900 text-base transition duration-300"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Email Preview Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-lg border border-amber-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Email Preview (Test Mode)</h3>
              <button onClick={closeEmailModal} className="text-gray-500 hover:text-amber-800 transform hover:scale-110 transition duration-300">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700">To:</label>
                <p className="mt-1 p-2 bg-gray-50 rounded-xl text-base">{emailDetails.to}</p>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Subject:</label>
                <p className="mt-1 p-2 bg-gray-50 rounded-xl text-base">{emailDetails.subject}</p>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700">Body:</label>
                <pre className="mt-1 p-2 bg-gray-50 rounded-xl whitespace-pre-wrap text-base">
                  {emailDetails.body}
                </pre>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeEmailModal}
                className="px-4 py-2 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-xl hover:bg-[#80533b] transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeeList;