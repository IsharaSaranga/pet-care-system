'use client'

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MapPin, Phone, Mail, Calendar } from 'lucide-react';

const PetDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const type = searchParams.get('type'); // 'lost' or 'found'

  useEffect(() => {
    fetchPetDetails();
  }, [id, type]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      const endpoint = type === 'lost' ? '/api/lost-and-found/lost' : '/api/lost-and-found/found';
      const response = await axios.get(`http://localhost:5000${endpoint}/${id}`);
      setPet(response.data);
    } catch (error) {
      console.error('Error fetching pet details:', error);
      toast.error('Failed to fetch pet details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#FFF5E6] py-8 mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D08860] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pet details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#FFF5E6] py-8 mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Pet not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#FFF5E6] py-8 mt-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {pet.image ? (
                <img
                  src={`http://localhost:5000/uploads/${pet.image}`}
                  alt={pet.petName || 'Pet'}
                  className="rounded-lg w-full h-96 object-cover"
                />
              ) : (
                <div className="bg-gray-200 rounded-lg w-full h-96"></div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#80533b] mb-4">
                {pet.petName || 'Unknown Pet'}
              </h1>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="text-[#D08860]" />
                  <p className="text-gray-600">
                    {type === 'lost' ? 'Last Seen Location:' : 'Found Location:'} {type === 'lost' ? pet.lastSeenLocation : pet.foundLocation}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="text-[#D08860]" />
                  <p className="text-gray-600">
                    {type === 'lost' ? 'Last Seen Date:' : 'Found Date:'} {new Date(type === 'lost' ? pet.lastSeenDate : pet.foundDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="text-[#D08860]" />
                  <p className="text-gray-600">Contact: {pet.contactNumber}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Mail className="text-[#D08860]" />
                  <p className="text-gray-600">Email: {pet.email}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#80533b] mb-2">Description</h3>
                  <p className="text-gray-600">{pet.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#80533b] mb-2">Type</h3>
                    <p className="text-gray-600 capitalize">{pet.petType}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#80533b] mb-2">Breed</h3>
                    <p className="text-gray-600">{pet.breed}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#80533b] mb-2">Color</h3>
                    <p className="text-gray-600">{pet.color}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#80533b] mb-2">Age</h3>
                    <p className="text-gray-600">{pet.age}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#80533b] mb-2">Gender</h3>
                    <p className="text-gray-600 capitalize">{pet.gender}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => navigate('/pet-lost-and-found')}
                  className="bg-[#D08860] text-white px-6 py-3 rounded-xl hover:bg-[#80533b] transition-colors"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDetails; 