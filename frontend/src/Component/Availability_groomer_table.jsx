'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { Search, CalendarCheck } from "lucide-react";

export default function GroomerAvailability() {
  const [availabilities, setAvailabilities] = useState([]);
  const [filteredAvailabilities, setFilteredAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalActionId, setModalActionId] = useState(null);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        console.log("Fetching groomer availabilities...");
        const response = await axios.get(
          "http://localhost:5000/api/appointments/groomer-Reqappointments",
          { timeout: 5000 }
        );
        console.log("Response:", response.data);
        const groomerData = response.data.data || response.data;
        const dataArray = Array.isArray(groomerData) ? groomerData : [];
        console.log("Processed availabilities:", dataArray);
        setAvailabilities(dataArray);
        setFilteredAvailabilities(dataArray);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response ? err.response.data.error : err.message);
        setLoading(false);
      }
    };

    fetchAvailabilities();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAvailabilities(availabilities);
    } else {
      const filtered = availabilities.filter((availability) =>
        (availability.professionalName || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAvailabilities(filtered);
    }
  }, [searchQuery, availabilities]);

  const showNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000); // Auto-dismiss after 3 seconds
  };

  const openModal = (type, id) => {
    setModalType(type);
    setModalActionId(id);
    setModalMessage(
      type === "accept"
        ? "Are you sure you want to accept this availability?"
        : "Are you sure you want to deny and delete this availability?"
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("");
    setModalActionId(null);
    setModalMessage("");
  };

  const handleAccept = async (id) => {
    try {
      setActionLoading(id);
      const response = await axios.patch(`http://localhost:5000/api/appointments/${id}/accept`);
      console.log("Accept response:", response.data);

      setAvailabilities(availabilities.filter((avail) => avail._id !== id));
      setFilteredAvailabilities(filteredAvailabilities.filter((avail) => avail._id !== id));

      showNotification("Request accepted and added to confirmed appointments!", "success");
    } catch (err) {
      console.error("Accept error:", err);
      const errorMsg = err.response ? err.response.data.error : err.message;
      showNotification(`Failed to accept appointment: ${errorMsg}`, "error");
    } finally {
      setActionLoading(null);
      closeModal();
    }
  };

  const handleDeny = async (id) => {
    try {
      setActionLoading(id);
      const response = await axios.patch(`http://localhost:5000/api/appointments/${id}/deny`);
      console.log("Deny response:", response.data);

      setAvailabilities(availabilities.filter((avail) => avail._id !== id));
      setFilteredAvailabilities(filteredAvailabilities.filter((avail) => avail._id !== id));

      showNotification("Request denied and removed successfully.", "success");
    } catch (err) {
      console.error("Deny error:", err);
      const errorMsg = err.response ? err.response.data.error : err.message;
      showNotification(`Failed to deny appointment: ${errorMsg}`, "error");
    } finally {
      setActionLoading(null);
      closeModal();
    }
  };

  const handleModalConfirm = async () => {
    if (modalType === "accept") {
      await handleAccept(modalActionId);
    } else if (modalType === "deny") {
      await handleDeny(modalActionId);
    }
  };

  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "N/A";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 animate-fade-in">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 text-red-500 bg-red-50 rounded-lg mx-auto max-w-2xl animate-fade-in">
        <p className="font-semibold">Error loading groomer availabilities</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen relative">
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg shadow-md ${
              notification.type === "success"
                ? "bg-amber-100 text-amber-950"
                : "bg-red-100 text-red-950"
            } animate-fade-in`}
            style={{ animationDelay: "0s" }}
          >
            {notification.message}
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-6 flex items-center text-amber-950 animate-fade-in">
        <CalendarCheck className="mr-2 text-amber-600" size={24} />
        Groomer Availability Requests
      </h2>

      <div className="mb-6 flex items-center gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by professional name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-amber-950"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" size={20} />
        </div>
      </div>

      {/* Table Container with Conditional Blur */}
      <div className="relative">
        <div className={`bg-white shadow-lg rounded-lg transition-all duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
          <table className="w-full table-fixed">
            <thead className="bg-amber-950 text-white">
              <tr>
                <th className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Professional Name
                </th>
                <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Qualification
                </th>
                <th className="w-[180px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Email
                </th>
                <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Given Date
                </th>
                <th className="w-[140px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Given Time Slot
                </th>
                <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Professional Fee
                </th>
                <th className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Special Note
                </th>
                <th className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-amber-950">
              {filteredAvailabilities.length === 0 ? (
                <tr className="animate-fade-in">
                  <td colSpan="8" className="text-center py-6 text-amber-950">
                    No groomer availability requests found
                  </td>
                </tr>
              ) : (
                filteredAvailabilities.map((availability, index) => (
                  <tr
                    key={availability._id || index}
                    className="border-b border-amber-200 hover:bg-amber-50 transition-colors duration-200 animate-slide-up"
                    style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                  >
                    <td className="w-[150px] px-4 py-3 text-sm truncate">
                      {availability.professionalName || "N/A"}
                    </td>
                    <td className="w-[120px] px-4 py-3 text-sm truncate">
                      {availability.specialization || "N/A"}
                    </td>
                    <td className="w-[180px] px-4 py-3 text-sm truncate">
                      {availability.email || "N/A"}
                    </td>
                    <td className="w-[120px] px-4 py-3 text-sm truncate">
                      {formatDate(availability.appointmentDate)}
                    </td>
                    <td className="w-[140px] px-4 py-3 text-sm truncate">
                      {availability.startTime || "N/A"} - {availability.endTime || "N/A"}
                    </td>
                    <td className="w-[120px] px-4 py-3 text-sm truncate">
                      ${availability.chargePerAppointment?.toFixed(2) || "0.00"}
                    </td>
                    <td className="w-[150px] px-4 py-3 text-sm truncate">
                      {availability.specialNotes || "N/A"}
                    </td>
                    <td className="w-[150px] px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal("accept", availability._id)}
                          className="bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 transition-colors duration-200 text-xs"
                          disabled={actionLoading === availability._id}
                        >
                          {actionLoading === availability._id ? "Processing..." : "Accept"}
                        </button>
                        <button
                          onClick={() => openModal("deny", availability._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors duration-200 text-xs"
                          disabled={actionLoading === availability._id}
                        >
                          {actionLoading === availability._id ? "Processing..." : "Deny"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Modal Positioned Over Table */}
        {isModalOpen && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl border border-amber-200 animate-fade-in">
              <h3 className="text-lg font-semibold text-amber-950 mb-4">{modalMessage}</h3>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-amber-200 text-amber-950 rounded-lg hover:bg-amber-300 transition-colors duration-200"
                >
                  No
                </button>
                <button
                  onClick={handleModalConfirm}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}