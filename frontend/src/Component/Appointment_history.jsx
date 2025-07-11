import React, { useState, useEffect } from 'react';
import { Search, XCircle } from 'lucide-react';

// Fallback API URL if environment variables are not available
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AppointmentAllCancelledTable = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Fetch all cancelled appointments and sort by date (newest to oldest)
  useEffect(() => {
    const fetchAllCancelledAppointments = async () => {
      try {
        const url = `${API_URL}/api/appointments/all-cancelled-appointments`;
        console.log('Fetching from URL:', url);

        const response = await fetch(url);
        const text = await response.text();
        console.log('Raw response:', text);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}. Response: ${text}`);
        }

        const data = JSON.parse(text);
        console.log('Parsed data:', data);

        // Sort appointments by appointmentDate (newest to oldest)
        const sortedData = data.sort((a, b) => 
          new Date(b.appointmentDate) - new Date(a.appointmentDate)
        );

        setAppointments(sortedData);
        setFilteredAppointments(sortedData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCancelledAppointments();
  }, []);

  // Handle search by user name
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAppointments(appointments);
    } else {
      const filtered = appointments.filter((appointment) =>
        appointment.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAppointments(filtered);
    }
  }, [searchQuery, appointments]);

  const showNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000); // Auto-dismiss after 3 seconds
  };

  const handleNotify = async (appointment) => {
    try {
      setActionLoading(appointment._id);
      // Simulate a notification API call (replace with actual API call if available)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
      showNotification(`Notified ${appointment.userName} at ${appointment.phoneNo}`, "success");
    } catch (err) {
      console.error("Notify error:", err);
      showNotification("Failed to notify user", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (appointment) => {
    try {
      setActionLoading(appointment._id);
      // Simulate a delete API call (replace with actual API call if available)
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation
      showNotification(`Deleted appointment for ${appointment.userName}`, "success");
    } catch (err) {
      console.error("Delete error:", err);
      showNotification("Failed to delete appointment", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return dateString
      ? new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';
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
        <p className="font-semibold">Error loading data</p>
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

      {/* Header */}
      <h2 className="text-2xl font-semibold mb-6 flex items-center text-amber-950 animate-fade-in">
        <XCircle className="mr-2 text-red-500" size={24} />
        Cancelled Appointments
      </h2>

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by user name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-amber-950"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500" size={20} />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white shadow-lg rounded-lg">
        <table className="w-full table-fixed">
          <thead className="bg-amber-950 text-white">
            <tr>
              <th className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">User Name</th>
              <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Appointment Date</th>
              <th className="w-[100px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Time</th>
              <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Professional ID</th>
              <th className="w-[100px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Price</th>
              <th className="w-[120px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone Number</th>
              <th className="w-[180px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
              <th className="w-[100px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="w-[150px] px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="text-amber-950">
            {filteredAppointments.length === 0 ? (
              <tr className="animate-fade-in">
                <td colSpan="9" className="text-center py-6 text-amber-950">
                  No cancelled appointments found
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appointment, index) => (
                <tr
                  key={appointment._id || index}
                  className="border-b border-amber-200 hover:bg-amber-50 transition-colors duration-200 animate-slide-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <td className="w-[150px] px-4 py-3 text-sm truncate">{appointment.userName}</td>
                  <td className="w-[120px] px-4 py-3 text-sm truncate">{formatDate(appointment.appointmentDate)}</td>
                  <td className="w-[100px] px-4 py-3 text-sm truncate">{appointment.appointmentTime || 'N/A'}</td>
                  <td className="w-[120px] px-4 py-3 text-sm truncate">{appointment.doctorId || appointment.groomerId || appointment.trainerId || 'N/A'}</td>
                  <td className="w-[100px] px-4 py-3 text-sm truncate">${appointment.appointmentFee?.toFixed(2) || '0.00'}</td>
                  <td className="w-[120px] px-4 py-3 text-sm truncate">{appointment.phoneNo}</td>
                  <td className="w-[180px] px-4 py-3 text-sm truncate">{appointment.email}</td>
                  <td className="w-[100px] px-4 py-3 text-sm truncate">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {appointment.status}
                    </span>
                  </td>
                  <td className="w-[150px] px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleNotify(appointment)}
                        className="bg-amber-600 text-white px-3 py-1 rounded-lg hover:bg-amber-700 transition-colors duration-200 text-xs"
                        disabled={actionLoading === appointment._id}
                      >
                        {actionLoading === appointment._id ? "Processing..." : "Notify"}
                      </button>
                      <button
                        onClick={() => handleDelete(appointment)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors duration-200 text-xs"
                        disabled={actionLoading === appointment._id}
                      >
                        {actionLoading === appointment._id ? "Processing..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
};

export default AppointmentAllCancelledTable;