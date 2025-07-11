import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Right_side from '../assets/ForAdoption01.jpeg'
import { AlertCircle, Dog, Cat, Heart, CheckCircle, Camera, Upload, PawPrint } from 'lucide-react';
import axios from 'axios';

const PetOwnerForm = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    // Owner Information
    ownerFirstName: '',
    ownerLastName: '',
    email: '',
    phone: '',
    userId: '',
    
    // Pet Information
    petName: '',
    petAge: '',
    petGender: '',
    petBreed: '',
    petSpecies: '',
    petDescription: '',
    petImage: null,
    
    // Additional Information
    reason: '',
    specialNeeds: false,
    vaccinated: false,
    neutered: false,
  });

  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const petSpeciesOptions = ['Dog', 'Cat'];
  const petGenderOptions = ['Male', 'Female'];

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('petOwnerToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const userData = JSON.parse(localStorage.getItem('petOwnerUser') || '{}');
        if (!userData._id) {
          navigate('/login');
          return;
        }

        // Set the form data with user information
        setFormData(prevData => ({
          ...prevData,
          ownerFirstName: userData.name.split(' ')[0] || '',
          ownerLastName: userData.name.split(' ').slice(1).join(' ') || '',
          email: userData.email || '',
          phone: userData.phoneNumber || '',
          userId: userData._id // Add userId to form data
        }));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (submissionStatus === 'success') {
      const timer = setTimeout(() => {
        navigate('/pet-owner-dashboard');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submissionStatus, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        petImage: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Owner Information Validation
    if (!formData.ownerFirstName.trim()) newErrors.ownerFirstName = 'First name is required';
    
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
    
    // Pet Information Validation
    if (!formData.petName.trim()) newErrors.petName = 'Pet name is required';
    if (!formData.petAge.trim()) newErrors.petAge = 'Pet age is required';
    if (!formData.petGender) newErrors.petGender = 'Please select pet gender';
    if (!formData.petSpecies) newErrors.petSpecies = 'Please select pet species';
    if (!formData.petBreed.trim()) newErrors.petBreed = 'Pet breed is required';
    if (!formData.petDescription.trim()) newErrors.petDescription = 'Pet description is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for giving up for adoption is required';
    
    // Image validation is optional
    if (!formData.petImage && !previewImage) newErrors.petImage = 'Please upload a pet image';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const data = new FormData();
      for (let key in formData) {
        if (key === 'petImage' && formData[key] instanceof File) {
          data.append(key, formData[key]);
        } else if (key !== 'petImage') {
          data.append(key, formData[key]);
        }
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post("http://localhost:5000/api/foradoption", data, {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        });
        setSubmissionStatus('success');
      } catch (error) {
        console.error("Error adding pet for adoption:", error);
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    }
  };

  const handleFormData = () => {
    navigate('/pet-owner-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B3704D] mx-auto"></div>
          <p className="mt-4 text-[#80533b]">Loading your information...</p>
        </div>
      </div>
    );
  }

  // Success message component
  const SuccessMessage = () => (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md">
        <CheckCircle className="mx-auto mb-6 text-green-500" size={80} />
        <h2 className="text-3xl font-bold text-[#80533b] mb-4">Pet Successfully Listed!</h2>
        <p className="text-xl mb-6">
          Thank you, {formData.ownerFirstName}! Your pet {formData.petName} has been successfully listed for adoption.
        </p>
        <p className="text-md text-gray-600 mb-6">
          We will review your listing and notify you when potential adopters show interest.
        </p>
        {/* No close button needed since it auto-closes */}
      </div>
    </div>
  );

  return (
    <>
      {submissionStatus === 'success' && <SuccessMessage />}
      
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-25 pb-12">
        {/* Page Title Section */}
        <div className="container mx-auto px-4 mb-12">
          <div className="text-center max-w-3xl mx-auto">
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              List Your Pet for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">
                Adoption
              </span>
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Help your pet find their forever home. Fill out the form below with care and attention to detail.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden flex border-2">
            {/* Image Section */}
            <div className="w-1/3 relative hidden md:block">
              <img 
                src={Right_side}
                alt="Pet adoption" 
                className="object-cover w-full h-full absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/30 flex items-center justify-center">
                <div className="text-white text-center p-8 transform transition-all duration-300 hover:scale-105">
                  <h2 className="text-3xl font-bold mb-4">
                    Find a Loving Home
                  </h2>
                  <p className="text-lg opacity-90">
                    Your pet deserves the best family
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="w-full md:w-2/3 p-8 md:p-12 overflow-y-auto">
              <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-8">
                {/* Owner Information Section */}
                <div className="bg-[#FFF5E6]/50 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#B3704D]/10 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#B3704D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[#80533b]">Owner Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="ownerFirstName" className="block text-md font-medium mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="ownerFirstName"
                        name="ownerFirstName"
                        value={formData.ownerFirstName}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                      />
                      {errors.ownerFirstName && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="mr-2" size={18} /> {errors.ownerFirstName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="ownerLastName" className="block text-md font-medium mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="ownerLastName"
                        name="ownerLastName"
                        value={formData.ownerLastName}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                      />
                      {errors.ownerLastName && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="mr-2" size={18} /> {errors.ownerLastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <label htmlFor="email" className="block text-md font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="mr-2" size={18} /> {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-md font-medium mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-gray-50 cursor-not-allowed"
                      />
                      {errors.phone && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="mr-2" size={18} /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pet Information Section */}
                <div className="bg-[#FFF5E6]/50 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#B3704D]/10 rounded-xl">
                      <PawPrint className="h-6 w-6 text-[#B3704D]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#80533b]">Pet Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="petName" className="block text-md font-medium mb-2">
                        Pet Name
                      </label>
                      <input
                        type="text"
                        id="petName"
                        name="petName"
                        value={formData.petName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          errors.petName ? 'border-red-500' : 'border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md`}
                      />
                      {errors.petName && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="mr-2" size={18} /> {errors.petName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="petAge" className="block text-md font-medium mb-2">
                        Pet Age
                      </label>
                      <input
                        type="text"
                        id="petAge"
                        name="petAge"
                        value={formData.petAge}
                        onChange={handleChange}
                        placeholder="e.g., 2 years"
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          errors.petAge ? 'border-red-500' : 'border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md`}
                      />
                      {errors.petAge && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="mr-2" size={18} /> {errors.petAge}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <label htmlFor="petSpecies" className="block text-md font-medium mb-2">
                        Pet Species
                      </label>
                      <select
                        id="petSpecies"
                        name="petSpecies"
                        value={formData.petSpecies}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          errors.petSpecies ? 'border-red-500' : 'border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md`}
                      >
                        <option value="">Select Species</option>
                        {petSpeciesOptions.map(species => (
                          <option key={species} value={species}>{species}</option>
                        ))}
                      </select>
                      {errors.petSpecies && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="mr-2" size={18} /> {errors.petSpecies}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="petGender" className="block text-md font-medium mb-2">
                        Pet Gender
                      </label>
                      <select
                        id="petGender"
                        name="petGender"
                        value={formData.petGender}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl border-2 ${
                          errors.petGender ? 'border-red-500' : 'border-gray-200'
                        } focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md`}
                      >
                        <option value="">Select Gender</option>
                        {petGenderOptions.map(gender => (
                          <option key={gender} value={gender}>{gender}</option>
                        ))}
                      </select>
                      {errors.petGender && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="mr-2" size={18} /> {errors.petGender}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="petBreed" className="block text-md font-medium mb-2">
                      Pet Breed
                    </label>
                    <input
                      type="text"
                      id="petBreed"
                      name="petBreed"
                      value={formData.petBreed}
                      onChange={handleChange}
                      placeholder="e.g., Golden Retriever, Siamese"
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.petBreed ? 'border-red-500' : 'border-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md`}
                    />
                    {errors.petBreed && (
                      <p className="mt-2 text-sm text-red-500 flex items-center">
                        <AlertCircle className="mr-2" size={18} /> {errors.petBreed}
                      </p>
                    )}
                  </div>

                  {/* Enhanced Pet Image Upload Section */}
                  <div className="mt-6">
                    <label htmlFor="petImage" className="block text-md font-medium mb-2">
                      Upload Pet Image
                    </label>
                    
                    <div className="mt-2">
                      <div className={`flex items-center justify-center w-full border-2 border-dashed rounded-xl p-6 ${
                        errors.petImage ? 'border-red-500' : 'border-gray-300'
                      } hover:border-[#B3704D] transition-colors`}>
                        <div className="space-y-2 text-center">
                          {previewImage ? (
                            <div className="relative mx-auto">
                              <img 
                                src={previewImage} 
                                alt="Pet preview" 
                                className="h-48 w-48 object-cover rounded-lg mx-auto"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewImage(null);
                                  setFormData({...formData, petImage: null});
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <>
                              <Camera className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="flex justify-center text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-[#B3704D] hover:text-[#D08860] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#B3704D]">
                                  <span>Upload a photo</span>
                                  <input 
                                    id="file-upload" 
                                    name="petImage" 
                                    type="file" 
                                    className="sr-only" 
                                    accept="image/*" 
                                    onChange={handleFileChange}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </>
                          )}
                        </div>
                      </div>
                      {errors.petImage && (
                        <p className="mt-2 text-sm text-red-500 flex items-center">
                          <AlertCircle className="mr-2" size={18} /> {errors.petImage}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="petDescription" className="block text-md font-medium mb-2">
                    Pet Description
                  </label>
                  <textarea
                    id="petDescription"
                    name="petDescription"
                    rows={5}
                    value={formData.petDescription}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.petDescription ? 'border-red-500' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md`}
                    placeholder="Describe your pet's personality, habits, likes and dislikes..."
                  ></textarea>
                  {errors.petDescription && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <AlertCircle className="mr-2" size={18} /> {errors.petDescription}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="reason" className="block text-md font-medium mb-2">
                    Reason for Adoption
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl border-2 ${
                      errors.reason ? 'border-red-500' : 'border-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-[#B3704D] transition-all duration-300 hover:shadow-md`}
                    placeholder="Why are you putting your pet up for adoption?"
                  ></textarea>
                  {errors.reason && (
                    <p className="mt-2 text-sm text-red-500 flex items-center">
                      <AlertCircle className="mr-2" size={18} /> {errors.reason}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="specialNeeds"
                      name="specialNeeds"
                      checked={formData.specialNeeds}
                      onChange={handleChange}
                      className="h-5 w-5 text-[#B3704D] focus:ring-[#D08860] border-gray-300 rounded"
                    />
                    <label htmlFor="specialNeeds" className="ml-3 text-md text-gray-900">
                      Special Needs
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="vaccinated"
                      name="vaccinated"
                      checked={formData.vaccinated}
                      onChange={handleChange}
                      className="h-5 w-5 text-[#B3704D] focus:ring-[#D08860] border-gray-300 rounded"
                    />
                    <label htmlFor="vaccinated" className="ml-3 text-md text-gray-900">
                      Vaccinated
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="neutered"
                      name="neutered"
                      checked={formData.neutered}
                      onChange={handleChange}
                      className="h-5 w-5 text-[#B3704D] focus:ring-[#D08860] border-gray-300 rounded"
                    />
                    <label htmlFor="neutered" className="ml-3 text-md text-gray-900">
                      Neutered/Spayed
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-6">
                  <button
                    type="submit"
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#D08860] to-[#B3704D] px-8 py-4 w-full
                             shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative flex items-center justify-center gap-2 z-10">
                      <Heart className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                      <span className="text-lg font-semibold text-white">List Pet for Adoption</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#B3704D] to-[#D08860] opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PetOwnerForm;