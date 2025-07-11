import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Heart, X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const UserEdit = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    city: '',
    profilePicture: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [crop, setCrop] = useState();
  const [imgSrc, setImgSrc] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('petOwnerToken');
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFormData({
          name: response.data.name,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          city: response.data.city,
          profilePicture: null
        });
        setPreviewImage(response.data.profilePicture || 'https://via.placeholder.com/150?text=Profile+Image');
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching profile');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  };

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );
    setCrop(crop);
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const getCroppedImg = async (src, crop) => {
    const image = new Image();
    image.src = src;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size to match the crop
        canvas.width = crop.width;
        canvas.height = crop.height;

        // Apply zoom and rotation
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Draw the cropped image
        ctx.drawImage(
          image,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          0,
          0,
          crop.width,
          crop.height
        );

        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg');
      };
    });
  };

  const handleCropComplete = async () => {
    if (!imgSrc || !crop) return;

    try {
      const croppedImage = await getCroppedImg(imgSrc, crop);
      const file = new File([croppedImage], 'profile-picture.jpg', { type: 'image/jpeg' });
      
      setFormData({ ...formData, profilePicture: file });
      setPreviewImage(URL.createObjectURL(croppedImage));
      setShowCropModal(false);
    } catch (error) {
      console.error('Error cropping image:', error);
      setError('Error processing image');
    }
  };

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

      const response = await axios.put('http://localhost:5000/api/users/updateProfile', formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data && response.data.user) {
        // Update local storage with new user data
        localStorage.setItem('petOwnerToken', response.data.token);
        localStorage.setItem('petOwnerUser', JSON.stringify({
          _id: response.data.user._id,
          name: response.data.user.name,
          email: response.data.user.email,
          phoneNumber: response.data.user.phoneNumber,
          city: response.data.user.city,
          profilePicture: response.data.user.profilePicture
        }));
        navigate('/profile');
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.message || 'Error updating profile. Please try again.');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      const token = localStorage.getItem('petOwnerToken');
      const response = await axios.post('http://localhost:5000/api/users/deleteProfile', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.message === 'Profile and associated data deleted successfully') {
        localStorage.removeItem('petOwnerToken');
        localStorage.removeItem('petOwnerUser');
        navigate('/');
      } else {
        setError('Failed to delete profile');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.response?.data?.message || 'Error deleting profile. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] flex items-center justify-center p-6 sm:p-12 mt-12">
      <div className="w-full max-w-[800px] bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 relative h-64 md:h-auto">
          <div className="absolute inset-0 bg-[url('./assets/editprofile.jpg')] bg-cover bg-center flex items-start justify-center pt-4">
            <div className="text-white text-center p-6">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Edit Your Profile</h2>
              <p className="text-lg sm:text-xl">Update your details to continue your journey</p>
            </div>
          </div>
        </div>


        <div className="w-full md:w-1/2 p-6 sm:p-12">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <Heart className="text-amber-950 mr-3" size={32} />
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-950">Edit Profile</h2>
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
              <label htmlFor="name" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                  error.includes('name') ? 'border-red-500' : 'border-amber-200'
                }`}
                placeholder="Your Name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                  error.includes('email') ? 'border-red-500' : 'border-amber-200'
                }`}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                pattern="\d{10}"
                title="Phone number must be a 10-digit number"
                className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                  error.includes('phoneNumber') ? 'border-red-500' : 'border-amber-200'
                }`}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                  error.includes('city') ? 'border-red-500' : 'border-amber-200'
                }`}
                placeholder="Your City"
              />
            </div>

            {error && !error.includes('name') && !error.includes('email') && !error.includes('phoneNumber') && !error.includes('city') && (
              <p className="text-center text-sm text-red-500 flex items-center justify-center">
                <AlertCircle className="mr-2" size={18} /> {error}
              </p>
            )}

            <div className="flex flex-col space-y-4 pt-4">
              <button
                type="submit"
                className="w-full bg-amber-700 text-white px-8 py-3 sm:py-4 rounded-lg text-md sm:text-lg font-semibold hover:bg-amber-800 transition-colors"
              >
                Update Profile
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-600 text-white px-8 py-3 sm:py-4 rounded-lg text-md sm:text-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[550px] border border-amber-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-amber-700"
            >
              <X size={24} />
            </button>
            <div className="flex items-center justify-center mb-6">
              <Heart className="text-amber-950 mr-2" size={30} />
              <h3 className="text-xl sm:text-2xl font-bold text-amber-950">Confirm Deletion</h3>
            </div>
            <p className="text-gray-900 mb-6 text-center">
              Are you sure you want to delete your profile? This action cannot be undone and will permanently delete all your data.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-gray-300 text-gray-900 rounded-lg text-md font-semibold hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                className="px-6 py-3 bg-amber-700 text-white rounded-lg text-md font-semibold hover:bg-amber-800 transition-colors"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-amber-950">Crop Profile Picture</h3>
              <button
                onClick={() => setShowCropModal(false)}
                className="text-gray-400 hover:text-amber-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="relative mb-4">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                className="max-h-[60vh] mx-auto"
              >
                <img
                  src={imgSrc}
                  onLoad={onImageLoad}
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease',
                  }}
                  alt="Crop preview"
                />
              </ReactCrop>
            </div>

            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={handleZoomOut}
                className="p-2 bg-amber-100 rounded-full hover:bg-amber-200"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <button
                onClick={handleZoomIn}
                className="p-2 bg-amber-100 rounded-full hover:bg-amber-200"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 bg-amber-100 rounded-full hover:bg-amber-200"
                title="Rotate"
              >
                <Move size={20} />
              </button>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCropModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                className="px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserEdit;