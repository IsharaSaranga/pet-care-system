import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AlertCircle, Heart, X, Trash2, Shield, UserPlus, Users, UserCog, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const PetEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    breed: '',
    petBYear: '',
    petimage: null,
    specialNotes: '',
    vaccinations: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Get admin name from localStorage or set default
  const admin = JSON.parse(localStorage.getItem('admin')) || { name: 'User' };
  const adminName = admin.name || 'User';

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('petOwnerToken');
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  // Fetch pet data on mount
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const token = localStorage.getItem('petOwnerToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }
        const response = await axios.get(`http://localhost:5000/api/pets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

        setFormData({
          name: response.data.name || '',
          gender: response.data.gender || '',
          breed: response.data.breed || '',
          petBYear: response.data.petBYear || '',
          specialNotes: response.data.specialNotes || '',
          vaccinations: response.data.vaccinations || '',
          petimage: null
        });
        setPreviewImage(response.data.petimage || '');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pet:', err);
        if (err.response) {
          if (err.response.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (err.response.status === 404) {
            setError('Pet not found.');
          } else {
            setError(err.response.data?.message || 'Error fetching pet');
          }
        } else if (err.request) {
          setError('No response from server. Please try again later.');
        } else {
          setError(err.message || 'Error fetching pet');
        }
        setLoading(false);
      }
    };
    fetchPet();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, petimage: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('petOwnerToken');
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.put(
        `http://localhost:5000/api/pets/update/${id}`,
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      if (response.data && response.data.pet) {
        navigate('/profile');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Error updating pet');
    }
  };

  // Handle delete pet
  const handleDeletePet = async () => {
    try {
      const token = localStorage.getItem('petOwnerToken');
      const response = await axios.delete(
        `http://localhost:5000/api/pets/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.message === 'Pet deleted successfully') {
        navigate('/UserProfileViewAppointment');
      } else {
        setError('Failed to delete pet');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Error deleting pet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-amber-950">
          <div className="w-6 h-6 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading pet details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] flex flex-col">
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
            <div className="relative h-48 flex flex-col items-center justify-center">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${previewImage || 'https://via.placeholder.com/150?text=Pet+Image'})`,
                  filter: 'blur(2px)',
                  zIndex: 0
                }}
              ></div>
              <div className="relative z-10 -bottom-16">
                <div className="relative">
                  <img
                    src={previewImage || 'https://via.placeholder.com/150?text=Pet+Image'}
                    alt="Pet"
                    className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                  <label
                    htmlFor="petimage"
                    className="absolute bottom-0 right-0 bg-amber-700 text-white p-2 rounded-full cursor-pointer hover:bg-amber-800 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </label>
                  <input
                    type="file"
                    id="petimage"
                    name="petimage"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="pt-20 pb-8 px-6 sm:px-12">
              <div className="flex items-center justify-center mb-8">
                <Heart className="text-amber-950 mr-3" size={32} />
                <h2 className="text-2xl sm:text-3xl font-bold text-amber-950">Edit Pet</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-amber-950 mb-2">
                    Pet Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                    placeholder="Pet Name"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-amber-950 mb-2">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="breed" className="block text-sm font-medium text-amber-950 mb-2">
                    Breed
                  </label>
                  <input
                    type="text"
                    id="breed"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                    placeholder="Breed"
                  />
                </div>

                <div>
                  <label htmlFor="petBYear" className="block text-sm font-medium text-amber-950 mb-2">
                    Birth Year
                  </label>
                  <input
                    type="number"
                    id="petBYear"
                    name="petBYear"
                    value={formData.petBYear}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                    placeholder="Birth Year"
                  />
                </div>

                <div>
                  <label htmlFor="vaccinations" className="block text-sm font-medium text-amber-950 mb-2">
                    Vaccinations
                  </label>
                  <textarea
                    id="vaccinations"
                    name="vaccinations"
                    value={formData.vaccinations}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                    placeholder="List your pet's vaccinations"
                    rows="3"
                  />
                </div>

                <div>
                  <label htmlFor="specialNotes" className="block text-sm font-medium text-amber-950 mb-2">
                    Special Notes
                  </label>
                  <textarea
                    id="specialNotes"
                    name="specialNotes"
                    value={formData.specialNotes}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                    placeholder="Any special notes about your pet"
                    rows="3"
                  />
                </div>

                {error && (
                  <p className="text-center text-sm text-red-500 flex items-center justify-center">
                    <AlertCircle className="mr-2" size={18} /> {error}
                  </p>
                )}

                <div className="flex flex-col space-y-4 pt-4">
                  <button
                    type="submit"
                    className="w-full bg-amber-700 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-amber-800 transition-colors"
                  >
                    Update Pet
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full bg-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Delete Pet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-[550px] border border-amber-100"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-amber-700"
            >
              <X size={24} />
            </button>
            <div className="flex items-center justify-center mb-6">
              <Heart className="text-amber-950 mr-2" size={30} />
              <h3 className="text-xl sm:text-2xl font-bold text-amber-950">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-900 mb-6 text-center">
              Are you sure you want to delete this pet's profile? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-900 rounded-lg text-md font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePet}
                className="px-6 py-3 bg-amber-700 text-white rounded-lg text-md font-semibold hover:bg-amber-800 transition-colors"
              >
                Delete Pet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetEdit;