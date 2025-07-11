import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const PetDetails = () => {
  const { appointmentId } = useParams();
  const [pet, setPet] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState(null);
  const [formData, setFormData] = useState({
    diagnosis: '',
    treatment: '',
    groomingService: '',
    groomerNotes: '',
    trainingFocus: '',
    trainerNotes: '',
    description: '',
    doctorId: '',
  });
  const [editReport, setEditReport] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showEndAppointmentModal, setShowEndAppointmentModal] = useState(false); // State for end appointment confirmation modal
  const [expandedSections, setExpandedSections] = useState({
    appointment: true,
    pet: true,
    reports: true,
  });
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('profToken');

  const showNotification = (message, type = "success") => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  };

  useEffect(() => {
    if (!token) {
      console.warn('No token found, redirecting to login');
      navigate('/professional/login');
      return;
    }

    console.log('Fetching data for appointmentId:', appointmentId);
    console.log('Token:', token);

    const fetchData = async () => {
      try {
        console.log('Fetching pet and appointment details...');
        const response = await axios.get(
          `http://localhost:5000/api/professional-appointments/${appointmentId}/pet-details`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000,
          }
        );

        if (!response.data || Object.keys(response.data).length === 0) {
          console.warn('No data returned for appointmentId:', appointmentId);
          setError('No pet or appointment details available.');
        } else {
          setPet(response.data.pet);
          setAppointment(response.data.appointment);
          console.log('Data fetched:', response.data);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });

        let errorMessage = 'An unexpected error occurred while loading data. Please try again later.';
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Request timed out. Please check your internet connection and try again.';
        } else if (error.response?.status === 401) {
          console.warn('Unauthorized access, clearing token and redirecting to login');
          localStorage.removeItem('profToken');
          localStorage.removeItem('profRole');
          navigate('/professional/login');
          return;
        } else if (error.response?.status === 400) {
          errorMessage = 'Invalid appointment ID format. Please check the appointment ID.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Unauthorized: You are not assigned to this appointment.';
        } else if (error.response?.status === 422) {
          errorMessage = error.response.data.message || 'No appointment or pet found for this ID.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Pet details endpoint not found. Please contact support.';
        }
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId, token, navigate]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddReportClick = () => {
    if (!appointment || appointment.status !== 'scheduled') {
      showNotification('Cannot add reports for non-scheduled appointments.', 'error');
      return;
    }
    setShowReportForm(true);
    setReportType(null);
    setFormData({
      diagnosis: '',
      treatment: '',
      groomingService: '',
      groomerNotes: '',
      trainingFocus: '',
      trainerNotes: '',
      description: '',
      doctorId: '',
    });
    setError(null);
  };

  const handleReportTypeSelect = (type) => {
    setReportType(type);
    setFormData({
      diagnosis: '',
      treatment: '',
      groomingService: '',
      groomerNotes: '',
      trainingFocus: '',
      trainerNotes: '',
      description: '',
      doctorId: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    console.log('Submitting report:', { type: reportType, ...formData });

    if (!reportType) {
      showNotification('Please select a report type.', 'error');
      return;
    }

    const requiredFields = {
      Medical: ['diagnosis', 'treatment'],
      Grooming: ['groomingService', 'groomerNotes'],
      Training: ['trainingFocus', 'trainerNotes'],
      vaccination: ['description', 'doctorId'],
    }[reportType];

    if (requiredFields.some((field) => !formData[field]?.trim())) {
      showNotification('All fields are required and cannot be empty.', 'error');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/professional-appointments/${appointmentId}/add-report`,
        { type: reportType, ...formData },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      setPet((prev) => ({
        ...prev,
        medicalRecords: response.data.updatedMedicalRecords,
      }));
      setShowReportForm(false);
      setReportType(null);
      setError(null);
      showNotification('Report added successfully!', 'success');
      console.log('Report added successfully:', response.data);
    } catch (error) {
      console.error('Error adding report:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.code === 'ECONNABORTED') {
        showNotification('Request timed out. Please check your internet connection.', 'error');
      } else if (error.response?.status === 400) {
        showNotification(error.response.data.message || 'Invalid report data. Please check your inputs.', 'error');
      } else if (error.response?.status === 401) {
        console.warn('Unauthorized, redirecting to login');
        localStorage.removeItem('profToken');
        localStorage.removeItem('profRole');
        navigate('/professional/login');
      } else if (error.response?.status === 403) {
        showNotification('You are not authorized to add a report for this appointment.', 'error');
      } else if (error.response?.status === 422) {
        showNotification(error.response.data.message || 'Invalid appointment or pet data.', 'error');
      } else {
        showNotification('Failed to add report. Please try again later.', 'error');
      }
    }
  };

  const handleDeleteReportClick = (reportId) => {
    setReportToDelete(reportId);
    setShowDeleteModal(true);
  };

  const handleDeleteReport = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/professional-appointments/${appointmentId}/reports/${reportToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      setPet((prev) => ({
        ...prev,
        medicalRecords: response.data.updatedMedicalRecords,
      }));
      setError(null);
      showNotification('Report deleted successfully!', 'success');
      console.log('Report deleted successfully:', response.data);
    } catch (error) {
      console.error('Error deleting report:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.code === 'ECONNABORTED') {
        showNotification('Request timed out. Please check your internet connection.', 'error');
      } else if (error.response?.status === 401) {
        console.warn('Unauthorized, redirecting to login');
        localStorage.removeItem('profToken');
        localStorage.removeItem('profRole');
        navigate('/professional/login');
      } else if (error.response?.status === 403) {
        showNotification('You are not authorized to delete this report.', 'error');
      } else if (error.response?.status === 404) {
        showNotification('Report not found.', 'error');
      } else {
        showNotification('Failed to delete report. Please try again later.', 'error');
      }
    } finally {
      setShowDeleteModal(false);
      setReportToDelete(null);
    }
  };

  const handleEditReport = (report) => {
    if (!appointment || appointment.status !== 'scheduled') {
      showNotification('Cannot edit reports for non-scheduled appointments.', 'error');
      return;
    }
    setEditReport(report);
    setReportType(report.type);
    setFormData({
      diagnosis: report.diagnosis || '',
      treatment: report.treatment || '',
      groomingService: report.groomingService || '',
      groomerNotes: report.groomerNotes || '',
      trainingFocus: report.trainingFocus || '',
      trainerNotes: report.trainerNotes || '',
      description: report.description || '',
      doctorId: report.doctorId || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!reportType) {
      showNotification('Please select a report type.', 'error');
      return;
    }

    const requiredFields = {
      Medical: ['diagnosis', 'treatment'],
      Grooming: ['groomingService', 'groomerNotes'],
      Training: ['trainingFocus', 'trainerNotes'],
      vaccination: ['description', 'doctorId'],
    }[reportType];

    if (requiredFields.some((field) => !formData[field]?.trim())) {
      showNotification('All fields are required and cannot be empty.', 'error');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/professional-appointments/${appointmentId}/reports/${editReport._id}`,
        { type: reportType, ...formData },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      setPet((prev) => ({
        ...prev,
        medicalRecords: response.data.updatedMedicalRecords,
      }));
      setShowEditModal(false);
      setEditReport(null);
      setReportType(null);
      setError(null);
      showNotification('Report updated successfully!', 'success');
      console.log('Report updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating report:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.code === 'ECONNABORTED') {
        showNotification('Request timed out. Please check your internet connection.', 'error');
      } else if (error.response?.status === 400) {
        showNotification(error.response.data.message || 'Invalid report data. Please check your inputs.', 'error');
      } else if (error.response?.status === 401) {
        console.warn('Unauthorized, redirecting to login');
        localStorage.removeItem('profToken');
        localStorage.removeItem('profRole');
        navigate('/professional/login');
      } else if (error.response?.status === 403) {
        showNotification('You are not authorized to update this report.', 'error');
      } else if (error.response?.status === 404) {
        showNotification('Report not found.', 'error');
      } else {
        showNotification('Failed to update report. Please try again later.', 'error');
      }
    }
  };

  const handleEndAppointmentClick = () => {
    setShowEndAppointmentModal(true);
  };

  const handleEndAppointment = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/professional-appointments/${appointmentId}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      console.log('Appointment ended successfully:', response.data);
      setAppointment(response.data.appointment);
      setError(null);
      showNotification('Appointment ended successfully!', 'success');
      navigate('/professional/appointments');
    } catch (error) {
      console.error('Error ending appointment:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      if (error.code === 'ECONNABORTED') {
        showNotification('Request timed out. Please check your internet connection.', 'error');
      } else if (error.response?.status === 401) {
        console.warn('Unauthorized, redirecting to login');
        localStorage.removeItem('profToken');
        localStorage.removeItem('profRole');
        navigate('/professional/login');
      } else if (error.response?.status === 403) {
        showNotification('You are not authorized to end this appointment.', 'error');
      } else if (error.response?.status === 400) {
        showNotification(error.response.data.message || 'Cannot end this appointment.', 'error');
      } else if (error.response?.status === 422) {
        showNotification('Appointment not found.', 'error');
      } else {
        showNotification('Failed to end appointment. Please try again later.', 'error');
      }
    } finally {
      setShowEndAppointmentModal(false);
    }
  };

  const calculateAge = (petBYear) => {
    const currentYear = new Date().getFullYear();
    return petBYear ? currentYear - petBYear : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA]">
        <div className="flex items-center space-x-2 animate-fade-in">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-950 text-lg font-medium">Loading pet details...</p>
        </div>
      </div>
    );
  }

  if (error && !pet) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA]">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md animate-fade-in">
          <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate('/view-appointments')}
            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            aria-label="Back to appointments"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Main Content Container with Conditional Blur */}
      <div
        className={`transition-all duration-300 ${
          showReportForm || showEditModal || showDeleteModal || notifications.length > 0 || showEndAppointmentModal
            ? 'filter blur-sm'
            : ''
        }`}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-amber-950 mb-8 text-center">Pet Details</h2>
          </motion.div>

          {pet ? (
            <div className="space-y-6">
              {/* Appointment Details Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div
                  className="flex justify-between items-center p-6 bg-amber-950 text-white cursor-pointer"
                  onClick={() => toggleSection('appointment')}
                  role="button"
                  aria-expanded={expandedSections.appointment}
                  aria-controls="appointment-details"
                >
                  <h3 className="text-xl font-semibold">Appointment Details</h3>
                  {expandedSections.appointment ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronDown className="w-6 h-6" />
                  )}
                </div>
                <AnimatePresence>
                  {expandedSections.appointment && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      id="appointment-details"
                      className="p-6"
                    >
                      {appointment ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-amber-950">
                          <p>
                            <strong className="font-medium">Date:</strong>{' '}
                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <p>
                            <strong className="font-medium">Time:</strong> {appointment.appointmentTime}
                          </p>
                          <p>
                            <strong className="font-medium">Type:</strong> {appointment.appointmentType}
                          </p>
                          <p>
                            <strong className="font-medium">Status:</strong>{' '}
                            <span
                              className={`capitalize ${
                                appointment.status === 'scheduled'
                                  ? 'text-green-600'
                                  : 'text-gray-600'
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          Appointment details unavailable. You may still view pet details and reports.
                        </p>
                      )}
                      {appointment?.status === 'scheduled' && (
                        <div className="mt-6">
                          <button
                            onClick={handleEndAppointmentClick}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            aria-label="End this appointment"
                          >
                            End Appointment
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Pet Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div
                  className="flex justify-between items-center p-6 bg-amber-950 text-white cursor-pointer"
                  onClick={() => toggleSection('pet')}
                  role="button"
                  aria-expanded={expandedSections.pet}
                  aria-controls="pet-details"
                >
                  <h3 className="text-xl font-semibold">Pet Information</h3>
                  {expandedSections.pet ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronDown className="w-6 h-6" />
                  )}
                </div>
                <AnimatePresence>
                  {expandedSections.pet && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      id="pet-details"
                      className="p-6"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-amber-950">
                        <p>
                          <strong className="font-medium">Pet ID:</strong> {pet.petId}
                        </p>
                        <p>
                          <strong className="font-medium">Name:</strong> {pet.name}
                        </p>
                        <p>
                          <strong className="font-medium">Gender:</strong> {pet.gender}
                        </p>
                        <p>
                          <strong className="font-medium">Breed:</strong> {pet.breed}
                        </p>
                        <p>
                          <strong className="font-medium">Age:</strong> {calculateAge(pet.petBYear)}
                        </p>
                        <p className="sm:col-span-2">
                          <strong className="font-medium">Special Notes:</strong>{' '}
                          {pet.specialNotes || 'None'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Reports Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div
                  className="flex justify-between items-center p-6 bg-amber-950 text-white cursor-pointer"
                  onClick={() => toggleSection('reports')}
                  role="button"
                  aria-expanded={expandedSections.reports}
                  aria-controls="reports-details"
                >
                  <h3 className="text-xl font-semibold">Reports</h3>
                  {expandedSections.reports ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronDown className="w-6 h-6" />
                  )}
                </div>
                <AnimatePresence>
                  {expandedSections.reports && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      id="reports-details"
                      className="p-6"
                    >
                      {pet.medicalRecords && pet.medicalRecords.length > 0 ? (
                        <div className="space-y-4">
                          {pet.medicalRecords.map((record, index) => (
                            <motion.div
                              key={record._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="border border-amber-200 rounded-lg p-4 bg-amber-50 flex flex-col sm:flex-row justify-between items-start gap-4 animate-slide-up"
                            >
                              <div className="space-y-1 text-amber-950">
                                <p>
                                  <strong className="font-medium">Type:</strong>{' '}
                                  <span className="text-amber-800">{record.type}</span>
                                </p>
                                <p>
                                  <strong className="font-medium">Date:</strong>{' '}
                                  {new Date(record.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                                {record.type === 'Medical' && (
                                  <>
                                    <p>
                                      <strong className="font-medium">Diagnosis:</strong>{' '}
                                      {record.diagnosis}
                                    </p>
                                    <p>
                                      <strong className="font-medium">Treatment:</strong>{' '}
                                      {record.treatment}
                                    </p>
                                  </>
                                )}
                                {record.type === 'Grooming' && (
                                  <>
                                    <p>
                                      <strong className="font-medium">Service:</strong>{' '}
                                      {record.groomingService}
                                    </p>
                                    <p>
                                      <strong className="font-medium">Notes:</strong>{' '}
                                      {record.groomerNotes}
                                    </p>
                                  </>
                                )}
                                {record.type === 'Training' && (
                                  <>
                                    <p>
                                      <strong className="font-medium">Focus:</strong>{' '}
                                      {record.trainingFocus}
                                    </p>
                                    <p>
                                      <strong className="font-medium">Notes:</strong>{' '}
                                      {record.trainerNotes}
                                    </p>
                                  </>
                                )}
                                {record.type === 'vaccination' && (
                                  <>
                                    <p>
                                      <strong className="font-medium">Description:</strong>{' '}
                                      {record.description}
                                    </p>
                                    <p>
                                      <strong className="font-medium">Doctor ID:</strong>{' '}
                                      {record.doctorId}
                                    </p>
                                  </>
                                )}
                              </div>
                              {appointment?.status === 'scheduled' && (
                                <div className="flex gap-2 self-end sm:self-start">
                                  <button
                                    onClick={() => handleEditReport(record)}
                                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    aria-label={`Edit ${record.type} report`}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteReportClick(record._id)}
                                    className="bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    aria-label={`Delete ${record.type} report`}
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No reports available.</p>
                      )}
                      {appointment?.status === 'scheduled' && (
                        <div className="mt-6">
                          <button
                            onClick={handleAddReportClick}
                            className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                            aria-label="Add a new report"
                          >
                            Add New Report
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Back Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-center mt-8"
              >
                <button
                  onClick={() => navigate('/professional/redirect/view-appointments')}
                  className="bg-amber-600 text-white px-8 py-3 rounded-lg hover:bg-amber-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  aria-label="Back to appointments"
                >
                  Back to Appointments
                </button>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-md p-8 text-center"
            >
              <p className="text-gray-500 text-lg mb-4">
                No pet details found for this appointment. Please ensure the appointment exists and is
                associated with a pet.
              </p>
              <button
                onClick={() => navigate('/professional/redirect/view-appointments')}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                aria-label="Back to appointments"
              >
                Back to Appointments
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Notification Popup with No Background Overlay */}
      <AnimatePresence>
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-2"
          >
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-xl shadow-lg border ${
                  notification.type === 'success'
                    ? 'bg-amber-100 border-amber-300 text-amber-950'
                    : 'bg-red-100 border-red-300 text-red-950'
                } animate-fade-in max-w-md text-center`}
              >
                {notification.message}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Report Form with Blur Effect */}
      <AnimatePresence>
        {showReportForm && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-lg z-50"
          >
            {!reportType ? (
              <div>
                <h3 className="text-xl font-semibold text-amber-950 mb-4">
                  Select Report Type
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <button
                    onClick={() => handleReportTypeSelect('Medical')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Select Medical report type"
                  >
                    Medical
                  </button>
                  <button
                    onClick={() => handleReportTypeSelect('Grooming')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    aria-label="Select Grooming report type"
                  >
                    Grooming
                  </button>
                  <button
                    onClick={() => handleReportTypeSelect('Training')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-label="Select Training report type"
                  >
                    Training
                  </button>
                  <button
                    onClick={() => handleReportTypeSelect('vaccination')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    aria-label="Select Vaccination report type"
                  >
                    Vaccination
                  </button>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => setShowReportForm(false)}
                    className="bg-gray-100 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    aria-label="Cancel adding report"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-amber-950">
                    Add {reportType} Report
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Close report form"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {reportType === 'Medical' && (
                  <>
                    <div className="mb-4">
                      <label
                        htmlFor="diagnosis"
                        className="block text-sm font-medium text-amber-950"
                      >
                        Diagnosis
                      </label>
                      <input
                        type="text"
                        id="diagnosis"
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                        placeholder="Enter diagnosis"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="treatment"
                        className="block text-sm font-medium text-amber-950"
                      >
                        Treatment
                      </label>
                      <input
                        type="text"
                        id="treatment"
                        name="treatment"
                        value={formData.treatment}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                        placeholder="Enter treatment details"
                        required
                        aria-required="true"
                      />
                    </div>
                  </>
                )}
                {reportType === 'Grooming' && (
                  <>
                    <div className="mb-4">
                      <label
                        htmlFor="groomingService"
                        className="block text-sm font-medium text-amber-950"
                      >
                        Grooming Service
                      </label>
                      <input
                        type="text"
                        id="groomingService"
                        name="groomingService"
                        value={formData.groomingService}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                        placeholder="Enter grooming service"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="groomerNotes"
                        className="block text-sm font-medium text-amber-950"
                      >
                        Groomer Notes
                      </label>
                      <input
                        type="text"
                        id="groomerNotes"
                        name="groomerNotes"
                        value={formData.groomerNotes}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                        placeholder="Enter groomer notes"
                        required
                        aria-required="true"
                      />
                    </div>
                  </>
                )}
                {reportType === 'Training' && (
                  <>
                    <div className="mb-4">
                      <label
                        htmlFor="trainingFocus"
                        className="block text-sm font-medium text-amber-950"
                      >
                        Training Focus
                      </label>
                      <input
                        type="text"
                        id="trainingFocus"
                        name="trainingFocus"
                        value={formData.trainingFocus}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                        placeholder="Enter training focus"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="trainerNotes"
                        className="block text-sm font-medium text-amber-950"
                      >
                        Trainer Notes
                      </label>
                      <input
                        type="text"
                        id="trainerNotes"
                        name="trainerNotes"
                        value={formData.trainerNotes}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                        placeholder="Enter trainer notes"
                        required
                        aria-required="true"
                      />
                    </div>
                  </>
                )}
                {reportType === 'vaccination' && (
                  <>
                    <div className="mb-4">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-amber-950"
                      >
                        Description
                      </label>
                      <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                        placeholder="Enter vaccination description"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="doctorId"
                        className="block text-sm font-medium text-amber-950"
                      >
                        Doctor ID
                      </label>
                      <input
                        type="text"
                        id="doctorId"
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleInputChange}
                        className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                        placeholder="Enter doctor ID"
                        required
                        aria-required="true"
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    aria-label="Submit report"
                  >
                    Submit Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="bg-gray-100 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    aria-label="Cancel adding report"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Report Modal with Blur Effect */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-lg z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-report-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="edit-report-title" className="text-xl font-semibold text-amber-950">
                Edit {reportType} Report
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close edit modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleUpdateReport}>
              {reportType === 'Medical' && (
                <>
                  <div className="mb-4">
                    <label
                      htmlFor="diagnosis"
                      className="block text-sm font-medium text-amber-950"
                    >
                      Diagnosis
                    </label>
                    <input
                      type="text"
                      id="diagnosis"
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                      placeholder="Enter diagnosis"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="treatment"
                      className="block text-sm font-medium text-amber-950"
                    >
                      Treatment
                    </label>
                    <input
                      type="text"
                      id="treatment"
                      name="treatment"
                      value={formData.treatment}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                      placeholder="Enter treatment details"
                      required
                      aria-required="true"
                    />
                  </div>
                </>
              )}
              {reportType === 'Grooming' && (
                <>
                  <div className="mb-4">
                    <label
                      htmlFor="groomingService"
                      className="block text-sm font-medium text-amber-950"
                    >
                      Grooming Service
                    </label>
                    <input
                      type="text"
                      id="groomingService"
                      name="groomingService"
                      value={formData.groomingService}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                      placeholder="Enter grooming service"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="groomerNotes"
                      className="block text-sm font-medium text-amber-950"
                    >
                      Groomer Notes
                    </label>
                    <input
                      type="text"
                      id="groomerNotes"
                      name="groomerNotes"
                      value={formData.groomerNotes}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                      placeholder="Enter groomer notes"
                      required
                      aria-required="true"
                    />
                  </div>
                </>
              )}
              {reportType === 'Training' && (
                <>
                  <div className="mb-4">
                    <label
                      htmlFor="trainingFocus"
                      className="block text-sm font-medium text-amber-950"
                    >
                      Training Focus
                    </label>
                    <input
                      type="text"
                      id="trainingFocus"
                      name="trainingFocus"
                      value={formData.trainingFocus}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                      placeholder="Enter training focus"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="trainerNotes"
                      className="block text-sm font-medium text-amber-950"
                    >
                      Trainer Notes
                    </label>
                    <input
                      type="text"
                      id="trainerNotes"
                      name="trainerNotes"
                      value={formData.trainerNotes}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                      placeholder="Enter trainer notes"
                      required
                      aria-required="true"
                    />
                  </div>
                </>
              )}
              {reportType === 'vaccination' && (
                <>
                  <div className="mb-4">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-amber-950"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                      placeholder="Enter vaccination description"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="doctorId"
                      className="block text-sm font-medium text-amber-950"
                    >
                      Doctor ID
                    </label>
                    <input
                      type="text"
                      id="doctorId"
                      name="doctorId"
                      value={formData.doctorId}
                      onChange={handleInputChange}
                      className="mt-1 w-full p-3 border border-amber-200 rounded-lg focus:ring-amber-500 focus:border-amber-500 transition duration-200 text-amber-950"
                      placeholder="Enter doctor ID"
                      required
                      aria-required="true"
                    />
                  </div>
                </>
              )}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  aria-label="Update report"
                >
                  Update Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-100 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="Cancel editing report"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal with Blur Effect */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-sm z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-report-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="delete-report-title" className="text-xl font-semibold text-amber-950">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close delete confirmation modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-amber-950 mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Confirm deletion"
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Appointment Confirmation Modal with Blur Effect */}
      <AnimatePresence>
        {showEndAppointmentModal && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 w-full max-w-sm z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-appointment-title"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 id="end-appointment-title" className="text-xl font-semibold text-amber-950">
                Confirm End Appointment
              </h3>
              <button
                onClick={() => setShowEndAppointmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close end appointment confirmation modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-amber-950 mb-6">
              Are you sure you want to end this appointment? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowEndAppointmentModal(false)}
                className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Cancel ending appointment"
              >
                Cancel
              </button>
              <button
                onClick={handleEndAppointment}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Confirm ending appointment"
              >
                End Appointment
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

export default PetDetails;