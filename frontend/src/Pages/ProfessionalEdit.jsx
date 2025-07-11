import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AlertCircle, Heart, X, Trash2, Shield, UserPlus, Users, UserCog, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfessionalEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pName: '',
    pemail: '',
    pphoneNumber: '',
    qualification: '',
    experience: '',
    description: '',
    role: 'groomer',
    profilePicture: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Get admin name from localStorage or set default
  const admin = JSON.parse(localStorage.getItem('admin')) || { name: 'Admin' };
  const adminName = admin.name || 'Admin';

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/StaffLogin');
  };

  // Fetch professional data on mount
  useEffect(() => {
    const fetchProfessional = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }
        const response = await axios.get(`http://localhost:5000/api/professionals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.data) {
          throw new Error('No data received from server');
        }

        setFormData({
          pName: response.data.pName || '',
          pemail: response.data.pemail || '',
          pphoneNumber: response.data.pphoneNumber || '',
          qualification: response.data.qualification || '',
          experience: response.data.experience || '',
          description: response.data.description || '',
          role: response.data.role || 'groomer',
          profilePicture: null
        });
        setPreviewImage(response.data.profilePicture || 'https://via.placeholder.com/150?text=Profile+Image');
        setLoading(false);
      } catch (err) {
        console.error('Error fetching professional:', err);
        if (err.response) {
          if (err.response.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (err.response.status === 404) {
            setError('Professional not found.');
          } else {
            setError(err.response.data?.message || 'Error fetching professional');
          }
        } else if (err.request) {
          setError('No response from server. Please try again later.');
        } else {
          setError(err.message || 'Error fetching professional');
        }
        setLoading(false);
      }
    };
    fetchProfessional();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePicture: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const formDataToSend = new FormData();

      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.put(
        `http://localhost:5000/api/professionals/update/${id}`,
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (response.data && response.data.professional) {
        // Update the preview image if a new one was uploaded
        if (response.data.professional.profilePicture) {
          setPreviewImage(response.data.professional.profilePicture);
        }
        navigate('/ProfessionalsList');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Update error:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response.status === 404) {
          setError('Professional not found.');
        } else {
          setError(err.response.data?.message || 'Error updating professional');
        }
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError('Error updating professional. Please try again.');
      }
    }
  };

  // Handle delete professional
  const handleDeleteProfessional = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `http://localhost:5000/api/professionals/delete/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.message === 'Profile deleted successfully') {
        navigate('/ProfessionalsList');
      } else {
        setError('Failed to delete professional');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Error deleting professional');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-amber-950">
          <div className="w-6 h-6 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading professional...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link to="/admin/redirect/user_admin" className="flex items-center space-x-2">
                <Shield className="text-[#D88C6D]" size={24} />
                <span className="text-xl font-bold text-[#4E2D21]">Dashboard</span>
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link to="/ProfessionalRegistration" className="flex items-center space-x-1 text-[#4E2D21] hover:text-[#D88C6D] transition-colors">
                  <UserPlus size={20} />
                  <span>Add Staff</span>
                </Link>
                <Link to="/ProfessionalsList" className="flex items-center space-x-1 text-[#4E2D21] hover:text-[#D88C6D] transition-colors">
                  <Users size={20} />
                  <span>Staff List</span>
                </Link>
                <Link to="/UsersList" className="flex items-center space-x-1 text-[#4E2D21] hover:text-[#D88C6D] transition-colors">
                  <UserCog size={20} />
                  <span>User List</span>
                </Link>
                <Link to="/AdminRegister" className="flex items-center space-x-1 text-[#4E2D21] hover:text-[#D88C6D] transition-colors">
                  <Shield size={20} />
                  <span>Add Admin</span>
                </Link>
              </nav>
            </div>

            {/* Right side - User info and Logout */}
            <div className="flex items-center space-x-4">
              <span className="text-[#4E2D21] font-medium">Welcome, {adminName}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-[#D88C6D] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#4E2D21] transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[900px] bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row box-border">
          {/* Left Image Section */}
          <div className="w-full md:w-1/2 h-64 md:h-auto flex items-center justify-center bg-[url('./assets/editprofesional.jpg')] bg-cover bg-center">
            <div className="text-white text-center p-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Edit Professional Profile</h2>
              <p className="text-lg sm:text-xl">Update professional details</p>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="w-full md:w-1/2 p-6 sm:p-12 flex flex-col justify-center">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <Heart className="text-amber-950 mr-3" size={32} />
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-950">Edit Professional</h2>
            </div>
            <div className="relative mb-6">
              <img
                src={previewImage}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg mx-auto"
              />
              <label
                htmlFor="profilePicture"
                className="absolute bottom-0 right-1/2 transform translate-x-1/2 bg-amber-700 text-white p-2 rounded-full cursor-pointer hover:bg-amber-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </label>
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="pName" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="pName"
                  name="pName"
                  value={formData.pName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                    error.includes('name') ? 'border-red-500' : 'border-amber-200'
                  }`}
                  placeholder="Professional Name"
                  aria-label="Professional Name"
                />
              </div>
              <div>
                <label htmlFor="pemail" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="pemail"
                  name="pemail"
                  value={formData.pemail}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                    error.includes('email') ? 'border-red-500' : 'border-amber-200'
                  }`}
                  placeholder="professional@email.com"
                  aria-label="Professional Email"
                />
              </div>
              <div>
                <label htmlFor="pphoneNumber" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="pphoneNumber"
                  name="pphoneNumber"
                  value={formData.pphoneNumber}
                  onChange={handleChange}
                  required
                  pattern="\d{10}"
                  title="Phone number must be a 10-digit number"
                  className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                    error.includes('phoneNumber') ? 'border-red-500' : 'border-amber-200'
                  }`}
                  placeholder="1224567890"
                  aria-label="Phone Number"
                />
              </div>
              <div>
                <label htmlFor="qualification" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                    error.includes('qualification') ? 'border-red-500' : 'border-amber-200'
                  }`}
                  placeholder="Professional Qualification"
                  aria-label="Professional Qualification"
                />
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                  Experience
                </label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border871c border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                    error.includes('experience') ? 'border-red-500' : 'border-amber-200'
                  }`}
                  placeholder="Years of Experience"
                  aria-label="Professional Experience"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                    error.includes('description') ? 'border-red-500' : 'border-amber-200'
                  }`}
                  placeholder="Professional Description"
                  aria-label="Professional Description"
                  rows="4"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                    error.includes('role') ? 'border-red-500' : 'border-amber-200'
                  }`}
                  aria-label="Professional Role"
                >
                  <option value="groomer">Groomer</option>
                  <option value="veterinarian">Veterinarian</option>
                  <option value="pet-trainer">Pet Trainer</option>
                </select>
              </div>

              {error && !error.includes('name') && !error.includes('email') && !error.includes('phoneNumber') && !error.includes('qualification') && !error.includes('experience') && !error.includes('role') && (
                <p className="text-center text-sm text-red-500 flex items-center justify-center">
                  <AlertCircle className="mr-2" size={18} /> {error}
                </p>
              )}

              <div className="flex flex-col space-y-4 pt-4">
                <button
                  type="submit"
                  className="w-full bg-amber-700 text-white px-8 py-2 sm:py-4 rounded-lg text-md sm:text-lg font-semibold hover:bg-amber-800 transition-colors"
                  aria-label="Update professional profile"
                >
                  Update Profile
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-600 text-white px-8 py-3 sm:py-4 rounded-lg text-md sm:text-lg font-semibold hover:bg-red-700 transition-colors"
                  aria-label="Delete professional profile"
                >
                  Delete Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowDeleteConfirm(false)}
          tabIndex={0}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-[550px] border border-amber-100 max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-labelledby="delete-confirm-title"
          >
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-amber-700"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <div className="flex items-center justify-center mb-6">
              <Heart className="text-amber-950 mr-2" size={30} />
              <h3 id="delete-confirm-title" className="text-xl sm:text-2xl font-bold text-amber-950">
                Confirm Deletion
              </h3>
            </div>
            <p className="text-gray-900 mb-6 text-center">
              Are you sure you want to delete this professional's profile? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-900 rounded-lg text-md font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfessional}
                className="px-6 py-3 bg-amber-700 text-white rounded-lg text-md font-semibold hover:bg-amber-800 transition-colors"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalEdit;