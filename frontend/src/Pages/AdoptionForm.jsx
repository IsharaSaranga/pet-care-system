import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Dog, Cat, Heart, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PetAdoptionForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { petName, petImage, petType } = location.state || {};

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('petOwnerToken');
    const userData = JSON.parse(localStorage.getItem('petOwnerUser') || '{}');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    // Split the full name into first and last name
    const [firstName = '', lastName = ''] = (userData.name || '').split(' ');

    // Auto-fill user data from localStorage
    setFormData(prev => ({
      ...prev,
      firstName: firstName,
      lastName: lastName,
      email: userData.email || '',
      phone: userData.phoneNumber || '', // Map phoneNumber to phone field
      petType: petType || '',
      preferredPet: petName || '',
      homeType: '',
      hasYard: false,
      otherPets: false,
      employmentStatus: '',
      additionalInfo: ''
    }));
  }, [navigate]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    petType: petType || '',
    preferredPet: petName || '',
    homeType: '',
    hasYard: false,
    otherPets: false,
    employmentStatus: '',
    additionalInfo: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [globalError, setGlobalError] = useState('');

  const petTypes = ['Dog', 'Cat', 'Either'];
  const homeTypes = ['House', 'Apartment', 'Condo', 'Other'];
  const employmentStatuses = ['Employed', 'Self-Employed', 'Student', 'Retired', 'Unemployed'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Clear global error when user makes any change
    if (globalError) {
      setGlobalError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/[^\d]/g, ''))) {
      newErrors.phone = 'Invalid phone number (10 digits)';
    }

    if (!formData.petType) newErrors.petType = 'Please select a pet type';
    if (!formData.homeType) newErrors.homeType = 'Please select home type';
    if (!formData.employmentStatus) newErrors.employmentStatus = 'Please select employment status';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 ? {} : newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setGlobalError('Please fix the errors below before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('petOwnerToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Map the form data to match the backend schema
      const adoptionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        petType: formData.petType,
        petName: formData.preferredPet,
        petImage: petImage,
        homeType: formData.homeType,
        employmentStatus: formData.employmentStatus,
        hasYard: formData.hasYard,
        hasOtherPets: formData.otherPets,
        additionalInfo: formData.additionalInfo
      };

      // Make API call to save adoption form
      const response = await axios.post(
        'http://localhost:5000/api/adoptionform/apply',
        adoptionData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status === 201) {
        setErrors({});
        setGlobalError('');
        setShowSuccessModal(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/pet-register-dashboard', { state: { adoptionSuccess: true } });
        }, 2000);
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          setGlobalError('Please log in to submit an adoption application.');
        } else if (data.message) {
          setGlobalError(data.message);
        } else {
          setGlobalError('An error occurred while submitting your application. Please try again.');
        }
      } else {
        setGlobalError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success message component
  const SuccessMessage = () => (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md">
        <CheckCircle className="mx-auto mb-6 text-green-500" size={80} />
        <h2 className="text-3xl font-bold text-[#80533b] mb-4">Application Submitted!</h2>
        <p className="text-xl mb-6">
          Thank you, {formData.firstName}! Your pet adoption application has been successfully submitted.
        </p>
        <p className="text-md text-gray-600 mb-6">
          We will review your application and contact you soon.
        </p>
        <button 
          onClick={() => setShowSuccessModal(false)}
          className="bg-[#B3704D] text-white px-8 py-3 rounded-xl hover:bg-[#D08860] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      {showSuccessModal && <SuccessMessage />}
      
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 flex items-center justify-center p-6">
        <div className="w-full max-w-10xl bg-white shadow-2xl rounded-3xl overflow-hidden flex border-2 border-[] mt-6">
          {/* Pet Details Section */}
          <div className="w-1/2 relative">
            {petImage ? (
              <img 
                src={petImage} 
                alt={petName || "Pet"} 
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <img 
                src="/api/placeholder/800/1200" 
                alt="Pet Adoption" 
                className="w-full h-full object-cover absolute inset-0"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[]/60 to-[]/60 flex items-center justify-center">
              <div className="text-white text-center p-8">
                {petName && (
                  <div>
                    <h2 className="text-4xl font-bold mb-4">
                      {petName} is Waiting for You!
                    </h2>
                    <p className="text-xl mb-4">
                      {petType === 'Dog' ? <Dog className="inline mr-2" size={32} /> : <Cat className="inline mr-2" size={32} />}
                      {petType} Adoption
                    </p>
                  </div>
                )}
                <p className="text-xl">Open your heart and home to a loving pet today</p>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="w-1/2 p-12 overflow-y-auto bg-white">
            <div className="flex items-center justify-center mb-8">
              <Heart className="text-[#80533b] mr-3" size={50} />
              <h2 className="text-3xl font-bold text-[#80533b]">Pet Adoption Application</h2>
            </div>

            {/* Global Error Message */}
            {globalError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <div className="flex items-center">
                  <AlertCircle className="text-red-500 mr-2" size={20} />
                  <p className="text-red-700">{globalError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-md font-medium text-[] mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-[] bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-md font-medium text-[] mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-[] bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block text-md font-medium text-[] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-[] bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-md font-medium text-[] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-[] bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="petType" className="block text-md font-medium text-[] mb-2">
                    Preferred Pet Type
                  </label>
                  <input
                    type="text"
                    id="petType"
                    name="petType"
                    value={formData.petType}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-[] bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="preferredPet" className="block text-md font-medium text-[] mb-2">
                    Preferred Pet Name
                  </label>
                  <input
                    type="text"
                    id="preferredPet"
                    name="preferredPet"
                    value={formData.preferredPet}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl border-2 border-[] bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="homeType" className="block text-md font-medium text-[] mb-2">
                    Home Type
                  </label>
                  <select
                    id="homeType"
                    name="homeType"
                    value={formData.homeType}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.homeType ? 'border-red-500' : 'border-[]'
                    } focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md`}
                  >
                    <option value="">Select Home Type</option>
                    {homeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.homeType && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <AlertCircle className="mr-2" size={18} /> {errors.homeType}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="employmentStatus" className="block text-md font-medium text-[] mb-2">
                    Employment Status
                  </label>
                  <select
                    id="employmentStatus"
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.employmentStatus ? 'border-red-500' : 'border-[]'
                    } focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md`}
                  >
                    <option value="">Select Employment Status</option>
                    {employmentStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {errors.employmentStatus && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <AlertCircle className="mr-2" size={18} /> {errors.employmentStatus}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasYard"
                    name="hasYard"
                    checked={formData.hasYard}
                    onChange={handleChange}
                    className="h-5 w-5 text-[#B3704D] focus:ring-[#D08860] border-gray-300 rounded"
                  />
                  <label htmlFor="hasYard" className="ml-3 text-md text-gray-900">
                    Do you have a yard?
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="otherPets"
                    name="otherPets"
                    checked={formData.otherPets}
                    onChange={handleChange}
                    className="h-5 w-5 text-[#B3704D] focus:ring-[#D08860] border-gray-300 rounded"
                  />
                  <label htmlFor="otherPets" className="ml-3 text-md text-gray-900">
                    Do you have other pets?
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="additionalInfo" className="block text-md font-medium text-[] mb-2">
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={5}
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-[] focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md"
                  placeholder="Tell us why you want to adopt a pet..."
                ></textarea>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-[#B3704D] hover:bg-[#D08860] text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="animate-spin mr-3" size={24} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Dog className="mr-3" size={24} />
                      Submit Adoption Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PetAdoptionForm;