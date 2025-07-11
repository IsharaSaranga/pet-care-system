import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import i1 from '../assets/i1.jpg';
import i2 from '../assets/i2.jpg';
import i3 from '../assets/i3.jpg';
import i4 from '../assets/i4.jpg';
import i5 from '../assets/i5.jpg';
import i6 from '../assets/i6.jpg';
import i7 from '../assets/i7.jpg';
import i8 from '../assets/i8.jpg';
import i9 from '../assets/i9.jpg';

// Custom Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm animate-slide-in-from-right ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-amber-200 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-from-right {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const PetProfile = () => {
  const [petId, setPetId] = useState('');
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const heroImages = [i1, i2, i3, i4, i5, i6, i7, i8, i9];

  // Carousel auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  // Hide notification
  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  const handleSearch = async () => {
    if (loading) return;
    console.log('handleSearch called with petId:', petId);
    setPetData(null);
    setLoading(true);

    const token = localStorage.getItem('profToken');
    if (!token) {
      showNotification('Authentication required. Please log in.', 'error');
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        showNotification('Session expired. Please log in again.', 'error');
        localStorage.removeItem('profToken');
        localStorage.removeItem('profRole');
        setLoading(false);
        return;
      }
    } catch (err) {
      showNotification('Invalid token. Please log in again.', 'error');
      localStorage.removeItem('profToken');
      localStorage.removeItem('profRole');
      setLoading(false);
      return;
    }

    const cleanPetId = petId.startsWith('#') ? petId.slice(1) : petId;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/appointments/pet/${cleanPetId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      setPetData(response.data.data);
    } catch (err) {
      console.error('API error:', err);
      if (err.response) {
        if (err.response.status === 401) {
          showNotification('Unauthorized. Please log in again.', 'error');
          localStorage.removeItem('profToken');
          localStorage.removeItem('profRole');
        } else if (err.response.status === 404) {
          showNotification('Pet not found. Please enter a valid Pet ID.', 'error');
        } else {
          showNotification(
            err.response.data.error || 'Error fetching pet medical records.',
            'error'
          );
        }
      } else {
        showNotification('Network error. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    try {
      console.log('Generating PDF for petId:', petData.id);
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`Pet Medical Reports for ${petData.id}`, 14, 20);

      let yOffset = 30;

      if (petData.medicalHistory.length > 0) {
        doc.setFontSize(14);
        doc.text('Medical History', 14, yOffset);
        autoTable(doc, {
          startY: yOffset + 5,
          head: [['Date', 'Diagnosis', 'Treatment']],
          body: petData.medicalHistory.map((item) => [
            item.date,
            item.diagnosis,
            item.treatment,
          ]),
          theme: 'striped',
        });
        yOffset = doc.lastAutoTable.finalY + 10;
      }

      if (petData.groomingHistory.length > 0) {
        doc.setFontSize(14);
        doc.text('Grooming History', 14, yOffset);
        autoTable(doc, {
          startY: yOffset + 5,
          head: [['Date', 'Service', 'Notes']],
          body: petData.groomingHistory.map((item) => [
            item.date,
            item.service,
            item.notes,
          ]),
          theme: 'striped',
        });
        yOffset = doc.lastAutoTable.finalY + 10;
      }

      if (petData.trainingHistory.length > 0) {
        doc.setFontSize(14);
        doc.text('Training History', 14, yOffset);
        autoTable(doc, {
          startY: yOffset + 5,
          head: [['Date', 'Focus', 'Notes']],
          body: petData.trainingHistory.map((item) => [
            item.date,
            item.focus,
            item.notes,
          ]),
          theme: 'striped',
        });
        yOffset = doc.lastAutoTable.finalY + 10;
      }

      if (petData.vaccinationHistory.length > 0) {
        doc.setFontSize(14);
        doc.text('Vaccination History', 14, yOffset);
        autoTable(doc, {
          startY: yOffset + 5,
          head: [['Date', 'Description', 'Doctor ID']],
          body: petData.vaccinationHistory.map((item) => [
            item.date,
            item.description,
            item.doctorId,
          ]),
          theme: 'striped',
        });
      }

      doc.save(`pet-medical-reports-${petData.id}.pdf`);
      showNotification('PDF generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', {
        message: error.message,
        stack: error.stack,
      });
      showNotification('Failed to generate PDF: ' + error.message, 'error');
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] p-8">
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      {/* Hero Image Carousel (shown when no pet data) */}
      {!petData && (
        <div className="relative h-[40vh] min-h-[300px] max-h-[500px] w-full max-w-4xl overflow-hidden rounded-xl shadow-lg mb-8 animate-fade-in">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentImageIndex === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-amber-950 bg-opacity-40"></div>
              <img
                src={image}
                alt={`Pet Care ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center text-center">
                <div className="text-amber-50 px-6">
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    Pet Profile Portal
                  </h1>
                  <p className="text-lg md:text-xl">
                    Access comprehensive pet medical records
                  </p>
                </div>
              </div>
            </div>
          ))}
          {/* Image Navigation Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleImageChange(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentImageIndex === index
                    ? 'bg-amber-50 scale-125'
                    : 'bg-amber-50 bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md mb-8 animate-slide-in"
        style={{ animationDelay: '0.2s' }}
      >
        <h2 className="text-2xl font-bold text-amber-950 mb-4 tracking-tight">
          Search Pet Profile
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              placeholder="Enter Pet ID (e.g., pet001)"
              className="w-full p-4 pl-12 border border-amber-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-amber-950 transition-all duration-300 hover:shadow-md placeholder-amber-400"
              disabled={loading}
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
          <button
            onClick={handleSearch}
            className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-600 disabled:bg-amber-400 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Pet Data */}
      {petData && (
        <div
          className="bg-white shadow-xl rounded-xl p-8 max-w-4xl w-full animate-slide-in"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex justify-end mb-6">
            <button
              onClick={downloadPDF}
              className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Download PDF
            </button>
          </div>

          <div>
            <h3 className="text-xl font-bold border-b border-amber-200 pb-3 text-amber-950 tracking-tight">
              Medical Records for Pet {petData.id}
            </h3>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-amber-700">
                Medical History
              </h4>
              {petData.medicalHistory.length > 0 ? (
                <table className="min-w-full bg-white border border-amber-200 rounded-lg mt-3 shadow-sm">
                  <thead>
                    <tr className="bg-amber-100 text-amber-950">
                      <th className="py-3 px-6 text-left font-semibold">Date</th>
                      <th className="py-3 px-6 text-left font-semibold">
                        Diagnosis
                      </th>
                      <th className="py-3 px-6 text-left font-semibold">
                        Treatment
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {petData.medicalHistory.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-amber-100 hover:bg-amber-50 transition-colors duration-200"
                      >
                        <td className="py-3 px-6 text-amber-950">{item.date}</td>
                        <td className="py-3 px-6 text-amber-950">
                          {item.diagnosis}
                        </td>
                        <td className="py-3 px-6 text-amber-950">
                          {item.treatment}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-amber-700 mt-3">
                  No medical history available.
                </p>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-amber-700">
                Grooming History
              </h4>
              {petData.groomingHistory.length > 0 ? (
                <table className="min-w-full bg-white border border-amber-200 rounded-lg mt-3 shadow-sm">
                  <thead>
                    <tr className="bg-amber-100 text-amber-950">
                      <th className="py-3 px-6 text-left font-semibold">Date</th>
                      <th className="py-3 px-6 text-left font-semibold">
                        Service
                      </th>
                      <th className="py-3 px-6 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {petData.groomingHistory.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-amber-100 hover:bg-amber-50 transition-colors duration-200"
                      >
                        <td className="py-3 px-6 text-amber-950">{item.date}</td>
                        <td className="py-3 px-6 text-amber-950">
                          {item.service}
                        </td>
                        <td className="py-3 px-6 text-amber-950">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-amber-700 mt-3">
                  No grooming history available.
                </p>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-amber-700">
                Training History
              </h4>
              {petData.trainingHistory.length > 0 ? (
                <table className="min-w-full bg-white border border-amber-200 rounded-lg mt-3 shadow-sm">
                  <thead>
                    <tr className="bg-amber-100 text-amber-950">
                      <th className="py-3 px-6 text-left font-semibold">Date</th>
                      <th className="py-3 px-6 text-left font-semibold">Focus</th>
                      <th className="py-3 px-6 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {petData.trainingHistory.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-amber-100 hover:bg-amber-50 transition-colors duration-200"
                      >
                        <td className="py-3 px-6 text-amber-950">{item.date}</td>
                        <td className="py-3 px-6 text-amber-950">{item.focus}</td>
                        <td className="py-3 px-6 text-amber-950">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-amber-700 mt-3">
                  No training history available.
                </p>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-lg font-semibold text-amber-700">
                Vaccination History
              </h4>
              {petData.vaccinationHistory.length > 0 ? (
                <table className="min-w-full bg-white border border-amber-200 rounded-lg mt-3 shadow-sm">
                  <thead>
                    <tr className="bg-amber-100 text-amber-950">
                      <th className="py-3 px-6 text-left font-semibold">Date</th>
                      <th className="py-3 px-6 text-left font-semibold">
                        Description
                      </th>
                      <th className="py-3 px-6 text-left font-semibold">
                        Doctor ID
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {petData.vaccinationHistory.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-amber-100 hover:bg-amber-50 transition-colors duration-200"
                      >
                        <td className="py-3 px-6 text-amber-950">{item.date}</td>
                        <td className="py-3 px-6 text-amber-950">
                          {item.description}
                        </td>
                        <td className="py-3 px-6 text-amber-950">
                          {item.doctorId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-amber-700 mt-3">
                  No vaccination history available.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

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

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }

        .animate-slide-in-from-right {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PetProfile;