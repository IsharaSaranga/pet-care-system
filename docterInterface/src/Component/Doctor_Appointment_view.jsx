import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ProfessionalAppointmentsTable() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('profToken');

  useEffect(() => {
    if (!token) {
      navigate('/professional/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/professional-appointments', {
          headers: { Authorization: ` Bearer ${token}` },
        });
        setAppointments(data);
        setFilteredAppointments(data); // Initialize filtered list
        setLoading(false);
      } catch (error) {
        console.error('Error fetching professional appointments:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('profToken');
          localStorage.removeItem('profRole');
          navigate('/professional/login');
        }
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token, navigate]);

  // Handle search input and filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAppointments(appointments);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = appointments
      .filter((appt) =>
        appt.userName.toLowerCase().includes(lowerSearchTerm)
      )
      .sort((a, b) => {
        const aName = a.userName.toLowerCase();
        const bName = b.userName.toLowerCase();

        // Exact match
        if (aName === lowerSearchTerm && bName !== lowerSearchTerm) return -1;
        if (bName === lowerSearchTerm && aName !== lowerSearchTerm) return 1;

        // Starts with
        if (aName.startsWith(lowerSearchTerm) && !bName.startsWith(lowerSearchTerm)) return -1;
        if (bName.startsWith(lowerSearchTerm) && !aName.startsWith(lowerSearchTerm)) return 1;

        // Contains (default sort by name)
        return aName.localeCompare(bName);
      });

    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const handleAttendAppointment = (appointmentId) => {
    navigate(`/professional/appointment/${appointmentId}/pet-details`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (loading) return <p className="text-center text-amber-950 text-lg font-medium animate-pulse">Loading...</p>;

  return (
    <div
      className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] p-8 min-h-screen"
    >
      <div className="flex justify-between items-center mb-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-3xl font-bold text-amber-950 tracking-tight">Scheduled Appointments</h2>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex items-center gap-4 max-w-lg mx-auto animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by pet owner name..."
            className="w-full p-4 pl-12 border border-amber-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white transition-all duration-300 hover:shadow-lg placeholder-amber-400 text-amber-950"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="bg-amber-600 text-white px-5 py-3 rounded-xl hover:bg-amber-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
          >
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <table className="min-w-full bg-white border border-amber-200 rounded-xl shadow-lg">
          <thead>
            <tr className="bg-amber-800 text-white">
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Pet Owner</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Time</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, index) => (
                <tr
                  key={appt._id}
                  className={`border-b border-amber-100 hover:bg-amber-50 transition-colors duration-200 ${
                    index === 0 && searchTerm ? 'bg-amber-100' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-amber-950 font-medium">{appt.userName}</td>
                  <td className="px-6 py-4 text-amber-950">{appt.appointmentType}</td>
                  <td className="px-6 py-4 text-amber-950">
                    {new Date(appt.appointmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-amber-950">{appt.appointmentTime}</td>
                  <td className="px-6 py-4 text-amber-950">{appt.phoneNo}</td>
                  <td className="px-6 py-4 text-amber-950">{appt.email}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleAttendAppointment(appt._id)}
                      className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
                    >
                      Attend Now
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-6 text-center text-amber-600 font-medium">
                  No matching appointments found.
                </td>
              </tr>
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

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}