import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';

const EditAdoptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    petType: '',
    petName: '',
    homeType: '',
    employmentStatus: '',
    hasYard: false,
    hasOtherPets: false,
    additionalInfo: ''
  });

  const token = localStorage.getItem('petOwnerToken');

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/adoptionform/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setFormData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load adoption form data');
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.put(`http://localhost:5000/api/adoptionform/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      navigate('/pet-register-dashboard');
    } catch (err) {
      console.error('Error updating form:', err);
      setError('Failed to update adoption form');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-[#80533b] mb-6">Edit Adoption Form</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
              <AlertCircle className="inline-block mr-2" size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Pet Type</label>
                <select
                  name="petType"
                  value={formData.petType}
                  disabled
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                  required
                >
                  <option value="">Select Pet Type</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Pet Name</label>
                <input
                  type="text"
                  name="petName"
                  value={formData.petName}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Home Type</label>
                <select
                  name="homeType"
                  value={formData.homeType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
                  required
                >
                  <option value="">Select Home Type</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Condo">Condo</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Employment Status</label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
                  required
                >
                  <option value="">Select Employment Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Student">Student</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasYard"
                  checked={formData.hasYard}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#D08860] focus:ring-[#D08860] border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700">Do you have a yard?</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="hasOtherPets"
                  checked={formData.hasOtherPets}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#D08860] focus:ring-[#D08860] border-gray-300 rounded"
                />
                <label className="ml-2 block text-gray-700">Do you have other pets?</label>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Additional Information</label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/pet-register-dashboard')}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#D08860] text-white rounded-lg hover:bg-[#80533b] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAdoptionForm; 