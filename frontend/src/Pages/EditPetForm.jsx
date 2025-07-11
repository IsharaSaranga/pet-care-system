import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Dog, Cat, Heart, CheckCircle, Camera, Upload, X, PawPrint } from 'lucide-react';

const EditPetForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    petName: '',
    petAge: '',
    petGender: '',
    petBreed: '',
    petSpecies: '',
    petDescription: '',
    reason: '',
    specialNeeds: false,
    vaccinated: false,
    neutered: false,
    petImage: null
  });

  const petSpeciesOptions = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'];
  const petGenderOptions = ['Male', 'Female'];

  // Fetch pet data
  useEffect(() => {
    const fetchPetData = async () => {
      try {
        console.log('Fetching pet data for ID:', id);
        const response = await axios.get(`http://localhost:5000/api/foradoption/${id}`);
        console.log('Received pet data:', response.data);
        setFormData(response.data);
        if (response.data.petImage) {
          setPreviewImage(`http://localhost:5000${response.data.petImage}`);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching pet data:", err);
        setError("Failed to load pet data. Please try again later.");
        setLoading(false);
      }
    };

    fetchPetData();
  }, [id]);

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
    
    if (!formData.petName.trim()) newErrors.petName = 'Pet name is required';
    if (!formData.petAge.trim()) newErrors.petAge = 'Pet age is required';
    if (!formData.petGender) newErrors.petGender = 'Please select pet gender';
    if (!formData.petSpecies) newErrors.petSpecies = 'Please select pet species';
    if (!formData.petBreed.trim()) newErrors.petBreed = 'Pet breed is required';
    if (!formData.petDescription.trim()) newErrors.petDescription = 'Pet description is required';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for giving up for adoption is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const data = new FormData();
        // Only include pet-related fields
        const petFields = [
          'petName',
          'petAge',
          'petGender',
          'petBreed',
          'petSpecies',
          'petDescription',
          'reason',
          'specialNeeds',
          'vaccinated',
          'neutered',
          'petImage'
        ];
        
        for (let key of petFields) {
          if (formData[key] !== null) {
            data.append(key, formData[key]);
          }
        }

        console.log('Submitting form data:', Object.fromEntries(data));
        const response = await axios.put(`http://localhost:5000/api/foradoption/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log('Update response:', response.data);
        
        setSubmissionStatus('success');
        setTimeout(() => {
          navigate('/pet-owner-dashboard');
        }, 2000);
      } catch (err) {
        console.error("Error updating pet:", err);
        setError("Failed to update pet listing. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B3704D] mx-auto"></div>
          <p className="mt-4 text-[#80533b]">Loading pet data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-[#80533b] mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/pet-owner-dashboard')}
              className="bg-[#B3704D] text-white px-6 py-2 rounded-lg hover:bg-[#D08860] transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <Heart className="text-[#80533b] mr-3" size={40} />
            <h2 className="text-3xl font-bold text-[#80533b]">Edit Pet Listing</h2>
          </div>

          {submissionStatus === 'success' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
              <CheckCircle className="inline-block mr-2" size={20} />
              Pet listing updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="grid grid-cols-2 gap-6">
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

              <div>
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

              <div>
                <label htmlFor="petDescription" className="block text-md font-medium mb-2">
                  Pet Description
                </label>
                <textarea
                  id="petDescription"
                  name="petDescription"
                  rows={4}
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

              <div>
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

              {/* Pet Image Upload */}
              <div>
                <label htmlFor="petImage" className="block text-md font-medium mb-2">
                  Pet Image
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
                            <X className="h-4 w-4" />
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
                </div>
              </div>

              {/* Pet Health Information */}
              <div className="grid grid-cols-3 gap-4">
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
                  <span className="text-lg font-semibold text-white">Update Pet Listing</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#B3704D] to-[#D08860] opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPetForm; 