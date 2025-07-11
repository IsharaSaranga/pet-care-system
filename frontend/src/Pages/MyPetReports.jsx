'use client'

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MapPin, Edit, Trash2, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const MyPetReports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lost');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('petOwnerToken');
    if (!token) {
      navigate('/login', { 
        state: { 
          from: { 
            pathname: '/my-pet-reports'
          } 
        } 
      });
      return;
    }
    fetchMyPets();
  }, [activeTab, navigate]);

  const fetchMyPets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('petOwnerToken');
      if (!token) {
        navigate('/login', { 
          state: { 
            from: { 
              pathname: '/my-pet-reports'
            } 
          } 
        });
        return;
      }

      const endpoint = activeTab === 'lost' ? '/api/lost-and-found/lost/user' : '/api/lost-and-found/found/user';
      const response = await axios.get(`http://localhost:5000${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`${activeTab} pets response:`, response.data);
      setPets(response.data);
    } catch (error) {
      console.error(`Error fetching ${activeTab} pets:`, error);
      if (error.response?.status === 401) {
        // If unauthorized, redirect to login
        navigate('/login', { 
          state: { 
            from: { 
              pathname: '/my-pet-reports'
            } 
          } 
        });
      } else {
        setError('Failed to fetch your pet reports');
      }
    } finally {
      setLoading(false);
    }
  };

  // If no token is present, don't render the component
  if (!localStorage.getItem('petOwnerToken')) {
    return null;
  }

  const handleEdit = (id) => {
    navigate(`/edit-${activeTab}-pet/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab} pet report?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('petOwnerToken');
      await axios.delete(`http://localhost:5000/api/lost-and-found/${activeTab}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`${activeTab === 'lost' ? 'Lost' : 'Found'} pet report deleted successfully`);
      fetchMyPets();
    } catch (error) {
      toast.error(error.response?.data?.message || `Error deleting ${activeTab} pet report`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#FFF5E6] py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => navigate('/pet-lost-and-found')}
            className="flex items-center gap-2 text-[#80533b] hover:text-[#D08860] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Lost & Found</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#80533b] mb-4">My Pet Reports</h1>
          <p className="text-lg text-gray-600">Manage your lost and found pet reports</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('lost')}
              className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-lg transform transition-all duration-300 ${
                activeTab === 'lost'
                  ? 'bg-[#D08860] text-white'
                  : 'bg-white text-[#80533b] hover:bg-gray-100'
              }`}
            >
              <MapPin size={20} />
              My Lost Pet Reports
            </button>
            <button
              onClick={() => setActiveTab('found')}
              className={`px-6 py-3 rounded-xl transition-colors flex items-center gap-2 shadow-lg transform transition-all duration-300 ${
                activeTab === 'found'
                  ? 'bg-[#D08860] text-white'
                  : 'bg-white text-[#80533b] hover:bg-gray-100'
              }`}
            >
              <MapPin size={20} />
              My Found Pet Reports
            </button>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => navigate(activeTab === 'lost' ? '/add-lost-pet' : '/add-found-pet')}
            className="bg-[#D08860] text-white px-6 py-3 rounded-xl hover:bg-[#80533b] transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Plus size={20} />
            {activeTab === 'lost' ? 'Report New Lost Pet' : 'Report New Found Pet'}
          </button>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D08860] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your reports...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600">You haven't reported any {activeTab} pets yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div key={pet._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative pt-[125%]">
                  {pet.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${pet.image}`}
                      alt={pet.petName}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-[#80533b] mb-2">{pet.petName}</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Type:</span> {pet.petType}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Breed:</span> {pet.breed}
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">
                      {activeTab === 'lost' ? 'Last Seen Location:' : 'Found Location:'}
                    </span>{' '}
                    {activeTab === 'lost' ? pet.lastSeenLocation : pet.foundLocation}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">
                      {activeTab === 'lost' ? 'Last Seen Date:' : 'Found Date:'}
                    </span>{' '}
                    {new Date(activeTab === 'lost' ? pet.lastSeenDate : pet.foundDate).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/pet-details/${pet._id}?type=${activeTab}`)}
                      className="bg-[#D08860] text-white px-4 py-2 rounded-lg hover:bg-[#80533b] transition-colors"
                    >
                      View Details
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(pet._id)}
                        className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(pet._id)}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPetReports; 