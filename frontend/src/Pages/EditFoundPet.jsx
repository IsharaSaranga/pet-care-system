'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EditFoundPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    petType: '',
    breed: '',
    color: '',
    gender: '',
    foundDate: '',
    foundLocation: '',
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
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const response = await axios.get(`http://localhost:5000/api/lost-and-found/found/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pet = response.data;
      setFormData({
        petType: pet.petType || '',
        breed: pet.breed || '',
        color: pet.color || '',
        gender: pet.gender || '',
        foundDate: pet.foundDate ? new Date(pet.foundDate).toISOString().split('T')[0] : '',
        foundLocation: pet.foundLocation || '',
        description: pet.description || '',
        contactNumber: pet.contactNumber || '',
        email: pet.email || '',
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
      const token = localStorage.getItem('petOwnerToken') || localStorage.getItem('adminToken');
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataToSend.append('image', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await axios.put(`http://localhost:5000/api/lost-and-found/found/${id}`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Found pet report updated successfully');
      navigate('/pet-lost-and-found');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating found pet report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this found pet report?')) {
      return;
    }

    try {
      const token = localStorage.getItem('petOwnerToken') || localStorage.getItem('adminToken');
      await axios.delete(`http://localhost:5000/api/lost-and-found/found/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Found pet report deleted successfully');
      navigate('/pet-lost-and-found');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting found pet report');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#FFF5E6] py-8 mt-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#80533b] mb-4">Edit Found Pet Report</h1>
          <p className="text-lg text-gray-600">Update the details of the found pet</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#80533b]">Edit Found Pet Report</h2>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Report
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-gray-700 mb-2">Pet Type</label>
                <input
                  type="text"
                  name="petType"
                  value={formData.petType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D08860]"
                  required
                />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Found Date</label>
                <input
                  type="date"
                  name="foundDate"
                  value={formData.foundDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#D08860] focus:border-[#D08860]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Found Location</label>
                <input
                  type="text"
                  name="foundLocation"
                  value={formData.foundLocation}
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

export default EditFoundPet; 