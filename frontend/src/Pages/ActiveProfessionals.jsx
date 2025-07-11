'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import { CalendarIcon, ScissorsIcon, ClipboardDocumentCheckIcon, MagnifyingGlassIcon, EnvelopeIcon, PhoneIcon, ClockIcon, AcademicCapIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

export default function ActiveProfessionals() {
  const [data, setData] = useState({ vet: [], groomer: [], 'pet-trainer': [] });
  const [selectedCategory, setSelectedCategory] = useState('vet'); // Default to Veterinarians
  const [filters, setFilters] = useState({
    vet: 'this-week', // Default to this-week for veterinarians
    groomer: 'today',
    'pet-trainer': 'today',
  });
  const [searchTerms, setSearchTerms] = useState({
    vet: '',
    groomer: '',
    'pet-trainer': '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveProfessionals = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/appointments/active-professionals?filter=${filters[selectedCategory]}`,
          { timeout: 5000 }
        );
        console.log("Response:", response.data);
        setData(response.data.data || { vet: [], groomer: [], 'pet-trainer': [] });
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response ? err.response.data.error : err.message);
        setLoading(false);
      }
    };

    fetchActiveProfessionals();
  }, [filters, selectedCategory]);

  const handleFilterChange = (category, value) => {
    setFilters((prev) => ({ ...prev, [category]: value }));
  };

  const handleSearchChange = (category, value) => {
    setSearchTerms((prev) => ({ ...prev, [category]: value }));
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

  const filteredAppointments = data[selectedCategory].filter((appointment) =>
    (appointment.professionalName || "")
      .toLowerCase()
      .includes(searchTerms[selectedCategory].toLowerCase())
  );

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
        <p className="font-semibold">Error loading active professionals</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen">
      <h1 className="text-3xl font-semibold mb-6 text-amber-950 animate-fade-in">View Active Professionals</h1>

      {/* Category Selection Buttons */}
      <div className="flex space-x-4 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <button
          onClick={() => setSelectedCategory('vet')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
            selectedCategory === 'vet'
              ? 'bg-amber-950 text-white'
              : 'bg-amber-200 text-amber-950 hover:bg-amber-600 hover:text-white'
          }`}
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          Veterinarians
        </button>
        <button
          onClick={() => setSelectedCategory('groomer')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
            selectedCategory === 'groomer'
              ? 'bg-amber-950 text-white'
              : 'bg-amber-200 text-amber-950 hover:bg-amber-600 hover:text-white'
          }`}
        >
          <ScissorsIcon className="mr-2 h-5 w-5" />
          Groomers
        </button>
        <button
          onClick={() => setSelectedCategory('pet-trainer')}
          className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
            selectedCategory === 'pet-trainer'
              ? 'bg-amber-950 text-white'
              : 'bg-amber-200 text-amber-950 hover:bg-amber-600 hover:text-white'
          }`}
        >
          <ClipboardDocumentCheckIcon className="mr-2 h-5 w-5" />
          Pet Trainers
        </button>
      </div>

      {/* Search and Filter for the Selected Category */}
      <div className="mb-6 flex items-center space-x-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={`Search ${selectedCategory === 'vet' ? 'veterinarians' : selectedCategory === 'groomer' ? 'groomers' : 'pet trainers'} by name...`}
            value={searchTerms[selectedCategory]}
            onChange={(e) => handleSearchChange(selectedCategory, e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-600 transition-all text-amber-950"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 h-5 w-5" />
        </div>

        {/* Filter Dropdown */}
        <div>
          <label htmlFor="filter" className="mr-2 text-sm font-medium text-amber-950">
            Filter by:
          </label>
          <select
            id="filter"
            value={filters[selectedCategory]}
            onChange={(e) => handleFilterChange(selectedCategory, e.target.value)}
            className="px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 text-amber-950"
          >
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {/* Display the Selected Category */}
      <Section
        title={
          selectedCategory === 'vet'
            ? 'Veterinarians'
            : selectedCategory === 'groomer'
            ? 'Groomers'
            : 'Pet Trainers'
        }
        icon={
          selectedCategory === 'vet'
            ? CalendarIcon
            : selectedCategory === 'groomer'
            ? ScissorsIcon
            : ClipboardDocumentCheckIcon
        }
        appointments={filteredAppointments}
        formatDate={formatDate}
      />
    </div>
  );
}

function Section({ title, icon: Icon, appointments, formatDate }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-6 flex items-center text-amber-950 animate-fade-in">
        <Icon className="mr-2 text-amber-600 h-8 w-8" />
        {title}
      </h2>
      {appointments.length === 0 ? (
        <p className="text-amber-950 text-lg animate-fade-in">No active {title.toLowerCase()} found for the selected period.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment, index) => (
            <div
              key={appointment._id || index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 p-6 border border-amber-200 animate-slide-up"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              {/* Header Section */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <Icon className="h-10 w-10 text-amber-500" />
                  <div>
                    <h3 className="text-2xl font-bold text-amber-950">
                      {appointment.professionalName || "N/A"}
                    </h3>
                    <span className="inline-block mt-1 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                      {appointment.qualification || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Body Section */}
              <div className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-3 text-amber-950">
                  <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="h-5 w-5 text-amber-500" />
                    <span className="text-sm">{appointment.email || "N/A"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="h-5 w-5 text-amber-500" />
                    <span className="text-sm">{appointment.phoneNumber || "N/A"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BriefcaseIcon className="h-5 w-5 text-amber-500" />
                    <span className="text-sm">{appointment.experience || "N/A"} of experience</span>
                  </div>
                </div>

                {/* Availability Section */}
                <div className="border-t border-amber-200 pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <ClockIcon className="h-6 w-6 text-amber-500" />
                    <h4 className="text-lg font-semibold text-amber-950">Availability</h4>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-amber-950 font-medium">
                      <span className="text-amber-500">Date:</span> {formatDate(appointment.appointmentDate)}
                    </p>
                    <p className="text-amber-950 font-medium">
                      <span className="text-amber-500">Time:</span>{" "}
                      {appointment.startTime || "N/A"} - {appointment.endTime || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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