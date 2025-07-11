'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EditLostPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    petName: '',
    petType: '',
    breed: '',
    color: '',
    age: '',
    gender: '',
    lastSeenDate: '',
    lastSeenLocation: '',
    description: '',
    contactNumber: '',
    email: '',
    image: null
  });

  useEffect(() => {
    fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/lost-and-found/lost/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pet = response.data;
      setFormData({
        petName: pet.petName,
        petType: pet.petType,
        breed: pet.breed,
        color: pet.color,
        age: pet.age,
        gender: pet.gender,
        lastSeenDate: new Date(pet.lastSeenDate).toISOString().split('T')[0],
        lastSeenLocation: pet.lastSeenLocation,
        description: pet.description,
        contactNumber: pet.contactNumber,
        email: pet.email,
        image: null
      });
    } catch (error) {
      console.error('Error fetching pet details:', error);
      toast.error('Failed to fetch pet details');
      navigate('/pet-lost-and-found');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataToSend.append('image', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.put(`http://localhost:5000/api/lost-and-found/lost/${id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Lost pet report updated successfully');
      navigate('/pet-lost-and-found');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating lost pet report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lost pet report?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/lost-and-found/lost/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Lost pet report deleted successfully');
      navigate('/pet-lost-and-found');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting lost pet report');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#FFF5E6] py-8 mt-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#80533b]">Edit Lost Pet Report</h2>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Report
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
                <input
                  type="text"
                  name="petName"
                  value={formData.petName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet Type</label>
                <select
                  name="petType"
                  value={formData.petType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                >
                  <option value="">Select Type</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Seen Date</label>
                <input
                  type="date"
                  name="lastSeenDate"
                  value={formData.lastSeenDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Seen Location</label>
                <input
                  type="text"
                  name="lastSeenLocation"
                  value={formData.lastSeenLocation}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pet Image</label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
              />
              <p className="text-sm text-gray-500 mt-1">Leave empty to keep current image</p>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/pet-lost-and-found')}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#D08860] text-white px-6 py-3 rounded-xl hover:bg-[#80533b] transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLostPet; 