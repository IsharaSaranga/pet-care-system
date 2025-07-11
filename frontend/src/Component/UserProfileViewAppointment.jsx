import React, { useState, useEffect } from 'react';
import { Calendar, Clock, List, X, CalendarClock, ChevronDown, ChevronUp, FileText, User, Mail, Phone, MapPin, CreditCard, PawPrint, ShoppingBag, Ticket, Edit } from 'lucide-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate for logout

const theme = {
  primary: "bg-[#D08860]",
  secondary: "bg-[#B3714E]",
  textPrimary: "text-white",
  textSecondary: "text-amber-950",
  accent: "bg-amber-100",
  border: "border-amber-200",
};

// Axios instance with token interceptor
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('petOwnerToken'); // Use petOwnerToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const ProfilePage = () => {
  const [showAppointmentSection, setShowAppointmentSection] = useState(false);
  const [showAdoptionSection, setShowAdoptionSection] = useState(false);
  const [showProductSection, setShowProductSection] = useState(false);
  const [showEventSection, setShowEventSection] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [adoptions, setAdoptions] = useState([]); // Added state for adoptions
  const [products, setProducts] = useState([]); // Added state for products
  const [events, setEvents] = useState([]); // Added state for events
  const [searchError, setSearchError] = useState('');
  const [adoptionError, setAdoptionError] = useState(''); // Added error state for adoptions
  const [productError, setProductError] = useState(''); // Added error state for products
  const [eventError, setEventError] = useState(''); // Added error state for events
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdoptions, setIsLoadingAdoptions] = useState(false); // Added loading state for adoptions
  const [isLoadingProducts, setIsLoadingProducts] = useState(false); // Added loading state for products
  const [isLoadingEvents, setIsLoadingEvents] = useState(false); // Added loading state for events
  const [isCancelling, setIsCancelling] = useState(false);
  const [user, setUser] = useState(null);
  const [userError, setUserError] = useState('');
  const [pets, setPets] = useState([]);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [petsError, setPetsError] = useState('');

  const navigate = useNavigate(); // Added for logout navigation

  const defaultProfilePic = "/assets/add.jpg";
  // Fetch user profile, pets, adoptions, products, and events on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      setUserError('');

      try {
        const response = await api.get('/users/profile');
        setUser({
          ...response.data,
          phone: response.data.phoneNumber,
          address: response.data.city,
          membership: "Premium",
          memberSince: "2021-03-15",
          paymentMethod: "Visa •••• 4242",
          profilePic: response.data.profilePicture || "https://randomuser.me/api/portraits/women/42.jpg"
        });
      } catch (error) {
        if (error.response?.status === 401) {
          setUserError('Please log in to view your profile');
        } else if (error.response?.status === 404) {
          setUserError('User profile not found');
        } else {
          setUserError(error.response?.data?.message || 'Failed to fetch profile');
        }
        console.error('Fetch user error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPets = async () => {
      setIsLoadingPets(true);
      setPetsError('');

      try {
        const response = await api.get('/pets/getUserPets');
        setPets(response.data || []);
      } catch (error) {
        if (error.response?.status === 404) {
          setPetsError('No pets found');
          setPets([]);
        } else {
          setPetsError(error.response?.data?.message || 'Failed to fetch pets');
        }
        console.error('Fetch pets error:', error);
      } finally {
        setIsLoadingPets(false);
      }
    };

    fetchUserProfile();
    fetchPets();
  }, []);

  const fetchAppointments = async () => {
    setIsLoading(true);
    setSearchError('');

    try {
      const response = await api.get('/appointments/active');
      const { appointments: fetchedAppointments } = response.data;
      setAppointments(fetchedAppointments || []);
    } catch (error) {
      if (error.response?.status === 401) {
        setSearchError('Please log in to view appointments');
      } else if (error.response?.status === 404) {
        setSearchError('No active appointments found');
        setAppointments([]);
      } else {
        setSearchError(error.response?.data?.message || 'Failed to fetch appointments');
      }
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdoptions = async () => {
    setIsLoadingAdoptions(true);
    setAdoptionError('');

    try {
      const response = await api.get('/adoptionform'); // Adjust endpoint as per your backend
      setAdoptions(response.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        setAdoptionError('Please log in to view adoptions');
      } else if (error.response?.status === 404) {
        setAdoptionError('No adoption records found');
        setAdoptions([]);
      } else {
        setAdoptionError(error.response?.data?.message || 'Failed to fetch adoptions');
      }
      console.error('Fetch adoptions error:', error);
    } finally {
      setIsLoadingAdoptions(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    setProductError('');

    try {
      const token = localStorage.getItem('petOwnerToken');
      if (!token) {
        setProductError('Please login to view orders');
        setIsLoadingProducts(false);
        return;
      }

      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenData.userId;

      const response = await axios.post(
        `http://localhost:5000/api/order/user`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setProducts(response.data.orders || []);
      } else {
        setProductError(response.data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        setProductError('Session expired. Please login again');
        navigate('/login');
      } else {
        setProductError(error.response?.data?.message || 'Failed to fetch orders');
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    setEventError('');

    try {
      const response = await api.get('/registrations'); // Adjust endpoint as per your backend
      setEvents(response.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        setEventError('Please log in to view events');
      } else if (error.response?.status === 404) {
        setEventError('No event registrations found');
        setEvents([]);
      } else {
        setEventError(error.response?.data?.message || 'Failed to fetch events');
      }
      console.error('Fetch events error:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleCancelWithRefund = async (appointmentId) => {
    const reason = window.prompt('Please enter reason for cancellation and refund request (min 10 characters):');
    if (!reason || reason.trim().length < 10) {
      alert('Refund reason is required and must be at least 10 characters');
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this appointment and request a refund?')) {
      return;
    }

    setIsCancelling(true);

    try {
      const response = await api.patch(`/appointments/${appointmentId}/cancel-with-refund`, {
        refundReason: reason,
      });

      const { data } = response.data;
      alert(`Success! Your refund request for $${data.refundRequest.netAmount.toFixed(2)} has been submitted.`);
      fetchAppointments();
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || 'Failed to process cancellation'}`);
      console.error('Cancellation error:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelWithoutRefund = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment without a refund?')) {
      return;
    }

    setIsCancelling(true);

    try {
      await api.patch(`/appointments/${appointmentId}/cancel`);
      alert('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || 'Failed to cancel appointment'}`);
      console.error('Cancellation error:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const toggleAppointmentSection = () => {
    setShowAppointmentSection(!showAppointmentSection);
    if (!showAppointmentSection) {
      fetchAppointments();
    } else {
      setAppointments([]);
      setSearchError('');
    }
  };

  const toggleAdoptionSection = () => {
    setShowAdoptionSection(!showAdoptionSection);
    if (!showAdoptionSection) {
      fetchAdoptions();
    } else {
      setAdoptions([]);
      setAdoptionError('');
    }
  };

  const toggleProductSection = () => {
    setShowProductSection(!showProductSection);
    if (!showProductSection) {
      fetchProducts();
    } else {
      setProducts([]);
      setProductError('');
    }
  };

  const toggleEventSection = () => {
    setShowEventSection(!showEventSection);
    if (!showEventSection) {
      fetchEvents();
    } else {
      setEvents([]);
      setEventError('');
    }
  };

  const handleLogout = () => {
    // Clear pet owner-specific keys
    localStorage.removeItem("petOwnerToken");
    localStorage.removeItem("petOwnerUser");
    navigate("/"); // Redirect to home page
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  // Placeholder images
  const defaultPetImage = "https://via.placeholder.com/150?text=Pet+Image";
  const addPetImage = "https://via.placeholder.com/150?text=Add+Pet";

  return (
    <div className={`min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8 mt-30`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Profile Section */}
        <div className="bg-white shadow-xl rounded-xl overflow-hidden border-2 border-amber-200">
          {isLoading && !user ? (
            <div className="text-center py-8 text-amber-800">Loading profile...</div>
          ) : userError ? (
            <div className="text-center py-8 text-red-500">{userError}</div>
          ) : user ? (
            <>
              <div className={`${theme.primary} p-4 flex items-center justify-between`}>
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-4 border-white mr-4 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultProfilePic;
                      }}
                    />
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold ${theme.textPrimary}`}>{user.name}</h1>
                    <p className={`${theme.textPrimary} opacity-90`}>{user.membership} Member</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white text-amber-800 px-4 py-2 rounded-lg hover:bg-amber-50 transition shadow-md border border-amber-200"
                >
                  Log Out
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className={`${theme.accent} p-2 rounded-full mr-4`}>
                      <Mail className="text-amber-800" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-800">Email Address</h3>
                      <p className="text-amber-700">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className={`${theme.accent} p-2 rounded-full mr-4`}>
                      <Phone className="text-amber-800" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-800">Phone Number</h3>
                      <p className="text-amber-700">{user.phone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className={`${theme.accent} p-2 rounded-full mr-4`}>
                      <MapPin className="text-amber-800" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-800">City</h3>
                      <p className="text-amber-700">{user.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className={`${theme.accent} p-2 rounded-full mr-4`}>
                      <Calendar className="text-amber-800" size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-800">Member Since</h3>
                      <p className="text-amber-700">{formatDate(user.memberSince)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div>
                      <h3 className="text-xl font-bold font-medium text-amber-800">My Pets</h3>
                      <div>
                        <div className="flex items-center space-x-4 mt-2">
                          {isLoadingPets ? (
                            <p className="text-gray-600">Loading pets...</p>
                          ) : petsError || pets.length === 0 ? (
                            <Link to="/PetRegister">
                              <button
                                className={`${theme.primary} ${theme.textPrimary} px-6 py-2 rounded-lg hover:${theme.secondary} transition flex items-center shadow-md`}
                              >
                                <PawPrint className="mr-2" size={18} />
                                Add a Pet
                              </button>
                            </Link>
                          ) : (
                            <>
                              {pets.map((pet) => (
                                <div key={pet._id} className="flex flex-col items-center">
                                  <Link to={`/PetEdit/${pet._id}`}>
                                    <img
                                      src={pet.petimage || defaultPetImage}
                                      alt={pet.name}
                                      className="w-16 h-16 rounded-full border-2 border-[#9a7656] object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultPetImage;
                                      }}
                                    />
                                  </Link>
                                  <p className="text-gray-800 text-sm mt-2">{pet.name}</p>
                                </div>
                              ))}
                              <div className="flex flex-col items-center">
                                <Link to="/PetRegister">
                                  <img
                                    src={addPetImage}
                                    alt="Add Pet"
                                    className="w-16 h-16 rounded-full border-2 border-[#9a7656] object-cover"
                                  />
                                </Link>
                                <p className="text-gray-800 text-sm mt-2">Add a Pet</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 flex justify-between">
                <Link to="/UserEdit">
                  <button
                    className={`${theme.primary} ${theme.textPrimary} px-6 py-2 rounded-lg hover:${theme.secondary} transition shadow-md flex items-center`}
                  >
                    <Edit className="mr-2" size={18} />
                    Edit Profile
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-amber-700">No profile data available</div>
          )}
        </div>

        {/* Activity Sections */}
        <div className="space-y-6">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden border-2 border-amber-200">
            <div className="p-6">
              <div className="flex justify-center mb-8">
                <button
                  onClick={toggleAppointmentSection}
                  className={`${theme.primary} ${theme.textPrimary} px-6 py-3 rounded-lg hover:${theme.secondary} transition flex items-center shadow-md`}
                >
                  <List className="mr-2" size={20} />
                  {showAppointmentSection ? 'Hide Appointments' : 'View Active Appointments'}
                  {showAppointmentSection ? (
                    <ChevronUp className="ml-2" size={20} />
                  ) : (
                    <ChevronDown className="ml-2" size={20} />
                  )}
                </button>
              </div>
              {showAppointmentSection && (
                <div className={`${theme.accent} rounded-lg p-6 mb-6 transition-all duration-300 shadow-inner ${theme.border} border`}>
                  <h2 className={`text-2xl font-bold ${theme.textSecondary} mb-6 flex items-center justify-center`}>
                    <Clock className="mr-3" size={24} />
                    Your Active Appointments
                  </h2>
                  {searchError && (
                    <div className="text-red-500 mb-6 text-center font-medium">{searchError}</div>
                  )}
                  {isLoading ? (
                    <div className="text-center py-8 text-amber-800">Loading appointments...</div>
                  ) : appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div
                          key={appointment._id}
                          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-amber-100"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-amber-800">
                                {appointment.appointmentType} Appointment
                              </h3>
                              <p className="text-amber-700">ID: {appointment._id.slice(-6)}</p>
                              <p className="text-amber-700">With Professional ID: {appointment.doctorId}</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                appointment.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : appointment.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-200 text-amber-800'
                              }`}
                            >
                              {appointment.status}
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <Calendar className="mr-2 text-amber-600" size={18} />
                              <span className="text-amber-700">
                                {formatDate(appointment.appointmentDate)} at{' '}
                                {formatTime(appointment.appointmentTime)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FileText className="mr-2 text-amber-600" size={18} />
                              <span className="text-amber-700">Fee: ${appointment.appointmentFee}</span>
                            </div>
                          </div>
                          {appointment.status === 'scheduled' && (
                            <div className="mt-5 pt-4 border-t border-amber-200">
                              <h4 className="font-medium mb-3 text-amber-800">Manage Appointment</h4>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                  onClick={() => handleCancelWithRefund(appointment._id)}
                                  disabled={isCancelling}
                                  className="px-4 py-2 bg-red-100 text-red-700  rounded-lg hover:bg-red-200 transition flex items-center justify-center disabled:bg-gray-300 shadow-sm"
                                >
                                  <X className="mr-2" size={18} />
                                  {isCancelling ? 'Processing...' : 'Cancel & Request Refund'}
                                </button>
                                <button
                                  onClick={() => handleCancelWithoutRefund(appointment._id)}
                                  disabled={isCancelling}
                                  className="px-4 py-2 bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 transition flex items-center justify-center disabled:bg-gray-300 shadow-sm"
                                >
                                  <X className="mr-2" size={18} />
                                  {isCancelling ? 'Processing...' : 'Cancel Without Refund'}
                                </button>
                                <button
                                  onClick={() => alert('Reschedule functionality would go here')}
                                  className={`px-4 py-2 ${theme.primary} ${theme.textPrimary} rounded-lg hover:${theme.secondary} transition flex items-center justify-center shadow-sm`}
                                >
                                  <CalendarClock className="mr-2" size={18} />
                                  Reschedule
                                </button>
                              </div>
                              <p className="text-sm text-amber-700 mt-3 italic">
                                Note: Refunds may take 5-7 business days to process.
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-amber-700 bg-white rounded-lg shadow-inner border border-amber-100">
                      No active appointments found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-xl overflow-hidden border-2 border-amber-200">
            <div className="p-6">
              <div className="flex justify-center mb-8">
                <button
                  onClick={toggleAdoptionSection}
                  className={`${theme.primary} ${theme.textPrimary} px-6 py-3 rounded-lg hover:${theme.secondary} transition flex items-center shadow-md`}
                >
                  <PawPrint className="mr-2" size={20} />
                  {showAdoptionSection ? 'Hide Adoptions' : 'View My Adoptions'}
                  {showAdoptionSection ? (
                    <ChevronUp className="ml-2" size={20} />
                  ) : (
                    <ChevronDown className="ml-2" size={20} />
                  )}
                </button>
              </div>
              {showAdoptionSection && (
                <div className={`${theme.accent} rounded-lg p-6 mb-6 transition-all duration-300 shadow-inner ${theme.border} border`}>
                  <h2 className={`text-2xl font-bold ${theme.textSecondary} mb-6 flex items-center justify-center`}>
                    <PawPrint className="mr-3" size={24} />
                    Your Adoption History
                  </h2>
                  {adoptionError && (
                    <div className="text-red-500 mb-6 text-center font-medium">{adoptionError}</div>
                  )}
                  {isLoadingAdoptions ? (
                    <div className="text-center py-8 text-amber-800">Loading adoptions...</div>
                  ) : adoptions.length > 0 ? (
                    <div className="space-y-4">
                      {adoptions.map((adoption) => (
                        <div key={adoption._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-amber-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-amber-800">
                                {adoption.petName || 'N/A'} - {adoption.petBreed || 'N/A'}
                              </h3>
                              <p className="text-amber-700">Adoption ID: {adoption._id.slice(-6)}</p>
                              <p className="text-amber-700">From: {adoption.shelter || 'N/A'}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              adoption.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-200 text-amber-800'
                            }`}>
                              {adoption.status || 'Pending'}
                            </span>
                          </div>
                          <div className="mt-4 flex items-center">
                            <Calendar className="mr-2 text-amber-600" size={18} />
                            <span className="text-amber-700">
                              Adopted on {formatDate(adoption.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-amber-700 bg-white rounded-lg shadow-inner border border-amber-100">
                      No adoption records found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-xl overflow-hidden border-2 border-amber-200">
            <div className="p-6">
              <div className="flex justify-center mb-8">
                <button
                  onClick={toggleProductSection}
                  className={`${theme.primary} ${theme.textPrimary} px-6 py-3 rounded-lg hover:${theme.secondary} transition flex items-center shadow-md`}
                >
                  <ShoppingBag className="mr-2" size={20} />
                  {showProductSection ? 'Hide Products' : 'View Purchased Products'}
                  {showProductSection ? (
                    <ChevronUp className="ml-2" size={20} />
                  ) : (
                    <ChevronDown className="ml-2" size={20} />
                  )}
                </button>
              </div>
              {showProductSection && (
                <div className={`${theme.accent} rounded-lg p-6 mb-6 transition-all duration-300 shadow-inner ${theme.border} border`}>
                  <h2 className={`text-2xl font-bold ${theme.textSecondary} mb-6 flex items-center justify-center`}>
                    <ShoppingBag className="mr-3" size={24} />
                    Your Purchased Products
                  </h2>
                  {productError && (
                    <div className="text-red-500 mb-6 text-center font-medium">{productError}</div>
                  )}
                  {isLoadingProducts ? (
                    <div className="text-center py-8 text-amber-800">Loading orders...</div>
                  ) : products.length > 0 ? (
                    <div className="space-y-4">
                      {products.map((order) => (
                        <div
                          key={order._id}
                          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-amber-100"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-amber-800">
                                Order #{order._id.slice(-6)}
                              </h3>
                              <p className="text-amber-700">Date: {new Date(order.date).toLocaleDateString()}</p>
                              <p className="text-amber-700">Total: <span className="font-semibold">${order.totalPrice}</span></p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'Out for Delivery' ? 'bg-indigo-100 text-indigo-800' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-amber-200 text-amber-800'
                            }`}>
                              {order.status || 'Pending'}
                            </span>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-amber-200">
                            <h4 className="font-medium mb-2 text-amber-800">Products:</h4>
                            <div className="space-y-3">
                              {order.products.map((product, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-md object-cover border border-amber-200" />
                                  ) : (
                                    <div className="w-12 h-12 bg-amber-100 rounded-md flex items-center justify-center">
                                      <span className="text-amber-800 text-xs">No image</span>
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium text-amber-900">{product.name}</p>
                                    <div className="flex items-center gap-2 text-sm text-amber-700">
                                      <span>${product.price}</span>
                                      <span>·</span>
                                      <span>Qty: {product.quantity}</span>
                                      <span>·</span>
                                      <span>Size: {product.size}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-4 flex items-center">
                            <span className={`flex items-center gap-1 text-sm ${
                              order.payment ? 'text-green-600' : 'text-amber-600'
                            }`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                {order.payment ? (
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                ) : (
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                                )}
                              </svg>
                              <span>{order.payment ? 'Paid' : 'Payment pending'}</span>
                            </span>
                            <span className="mx-3 text-amber-300">|</span>
                            <span className="text-sm text-amber-700">Method: {order.paymentMethod}</span>
                          </div>
                          
                          <div className="mt-4">
                            <Link to="/orders">
                              <button className={`${theme.primary} ${theme.textPrimary} px-4 py-2 rounded-lg hover:${theme.secondary} transition shadow-sm text-sm`}>
                                View All Orders
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-amber-700 bg-white rounded-lg shadow-inner border border-amber-100">
                      No orders found. <Link to="/collection" className="text-[#D08860] hover:underline">Shop now</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow-xl rounded-xl overflow-hidden border-2 border-amber-200">
            <div className="p-6">
              <div className="flex justify-center mb-8">
                <button
                  onClick={toggleEventSection}
                  className={`${theme.primary} ${theme.textPrimary} px-6 py-3 rounded-lg hover:${theme.secondary} transition flex items-center shadow-md`}
                >
                  <Ticket className="mr-2" size={20} />
                  {showEventSection ? 'Hide Events' : 'View Registered Events'}
                  {showEventSection ? (
                    <ChevronUp className="ml-2" size={20} />
                  ) : (
                    <ChevronDown className="ml-2" size={20} />
                  )}
                </button>
              </div>
              {showEventSection && (
                <div className={`${theme.accent} rounded-lg p-6 mb-6 transition-all duration-300 shadow-inner ${theme.border} border`}>
                  <h2 className={`text-2xl font-bold ${theme.textSecondary} mb-6 flex items-center justify-center`}>
                    <Ticket className="mr-3" size={24} />
                    Your Registered Events
                  </h2>
                  {eventError && (
                    <div className="text-red-500 mb-6 text-center font-medium">{eventError}</div>
                  )}
                  {isLoadingEvents ? (
                    <div className="text-center py-8 text-amber-800">Loading events...</div>
                  ) : events.length > 0 ? (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition border border-amber-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg text-amber-800">
                                {event.event?.title || 'N/A'}
                              </h3>
                              <p className="text-amber-700">Location: {event.event?.location || 'N/A'}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-200 text-amber-800'
                            }`}>
                              {event.status || 'Pending'}
                            </span>
                          </div>
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center">
                              <Calendar className="mr-2 text-amber-600" size={18} />
                              <span className="text-amber-700">
                                {formatDate(event.event?.date)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="mr-2 text-amber-600" size={18} />
                              <span className="text-amber-700">Time: {formatTime(event.event?.time)}</span>
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-amber-200">
                            <Link to={`/events/${event.event?._id}`}>
                              <button className={`${theme.primary} ${theme.textPrimary} px-4 py-2 rounded-lg hover:${theme.secondary} transition shadow-sm`}>
                                View Event Details
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-amber-700 bg-white rounded-lg shadow-inner border border-amber-100">
                      No event registrations found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;