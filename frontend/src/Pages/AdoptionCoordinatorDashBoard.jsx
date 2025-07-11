import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  PawPrint, 
  CalendarCheck, 
  FileText, 
  Dog, 
  Cat, 
  Home, 
  User, 
  PlusCircle,
  HeartHandshake,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  CheckCircle,
  Search,
  MapPin,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  PieChart,
  LogOut
} from 'lucide-react';
import jsPDF from 'jspdf';

const PetAdoptionCoordinatorDashboard = () => {
  const [pendingPets, setPendingPets] = useState([]); // For pets in foradoption table
  const [adoptablePets, setAdoptablePets] = useState([]); // For pets in adoptablepets table
  const [homeVisits, setHomeVisits] = useState([]);
  const [activeSection, setActiveSection] = useState(() => {
    // Initialize activeSection from localStorage or default to 'pets'
    return localStorage.getItem('activeSection') || 'pets';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAddPetModal, setShowAddPetModal] = useState(false);
  const [adoptionForms, setAdoptionForms] = useState([]);
  const [newPet, setNewPet] = useState({
    petName: '',
    petSpecies: 'Dog',
    petBreed: '',
    petAge: '',
    petGender: 'Male',
    vaccinated: false,
    neutered: false,
    specialNeeds: false,
    status: 'Available'
  });
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, petId: null, petName: '' });
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [lostPets, setLostPets] = useState([]);
  const [foundPets, setFoundPets] = useState([]);
  const [lostFoundSection, setLostFoundSection] = useState('lost'); // 'lost' or 'found'
  const [hiddenPetIds, setHiddenPetIds] = useState(() => {
    // Load hidden pet IDs from localStorage on initial render
    const savedHiddenIds = localStorage.getItem('hiddenPetIds');
    return savedHiddenIds ? new Set(JSON.parse(savedHiddenIds)) : new Set();
  });
  const [petListView, setPetListView] = useState('pending'); // 'pending' or 'adoptable'
  const [applicationFilter, setApplicationFilter] = useState('all'); // Add this with other state variables
  const [visitFilter, setVisitFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [highlightedFormId, setHighlightedFormId] = useState(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const navigate = useNavigate();

  // Fetch pending pets from foradoption table
  const fetchPendingPets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/foradoption');
      
      // Get all adoptable pets to check which ones are already added
      const adoptableResponse = await axios.get('http://localhost:5000/api/adoptablepets');
      const adoptablePetIds = adoptableResponse.data.map(pet => pet.originalPetId || pet._id);
      
      // Filter out pets that are already in the adoptable list
      const filteredPendingPets = response.data.filter(pet => !adoptablePetIds.includes(pet._id));
      
      setPendingPets(filteredPendingPets);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending pets:", err);
      setError("Failed to load pending pets data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch adoptable pets from adoptablepets table
  const fetchAdoptablePets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/adoptablepets');
      setAdoptablePets(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching adoptable pets:", err);
      setError("Failed to load adoptable pets data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch adoption forms
  const fetchAdoptionForms = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        console.error("No token found in localStorage");
        setError("Authentication required. Please log in again.");
        return;
      }

      console.log("Attempting to fetch adoption forms with token:", token);
      const response = await axios.get('http://localhost:5000/api/adoptionform/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("Adoption forms response:", response.data);
      setAdoptionForms(response.data);
    } catch (err) {
      console.error("Error fetching adoption forms:", err);
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        console.error("Error response headers:", err.response.headers);
        setError(`Failed to load adoption forms: ${err.response.data.message || err.response.statusText}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error("Error request:", err.request);
        setError("No response received from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", err.message);
        setError(`Failed to load adoption forms: ${err.message}`);
      }
    }
  };

  // Add this function to fetch home visits
  const fetchHomeVisits = async () => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/homevisits', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHomeVisits(response.data);
    } catch (error) {
      console.error('Error fetching home visits:', error);
      setError('Failed to load home visits');
    }
  };

  // Update the fetch functions
  const fetchLostPets = async () => {
    try {
      console.log('Fetching lost pets...');
      const response = await axios.get('http://localhost:5000/api/lost-and-found/lost');
      console.log('Lost pets response:', response.data);
      setLostPets(response.data);
    } catch (error) {
      console.error('Error fetching lost pets:', error);
      setError('Failed to load lost pets');
    }
  };

  const fetchFoundPets = async () => {
    try {
      console.log('Fetching found pets...');
      const response = await axios.get('http://localhost:5000/api/lost-and-found/found');
      console.log('Found pets response:', response.data);
      setFoundPets(response.data);
    } catch (error) {
      console.error('Error fetching found pets:', error);
      setError('Failed to load found pets');
    }
  };

  // Fetch adopted pets
  const fetchAdoptedPets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/adoptedpets');
      setAdoptedPets(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching adopted pets:", err);
      setError("Failed to load adopted pets data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPets();
    fetchAdoptablePets();
    fetchAdoptedPets();
    fetchAdoptionForms();
    fetchHomeVisits();
    fetchLostPets();
    fetchFoundPets();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPet({
      ...newPet,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle form submission to add a new pet
  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append all pet data to formData
      Object.keys(newPet).forEach(key => {
        formData.append(key, newPet[key]);
      });
      
      // If there's a file input for pet image
      const fileInput = document.getElementById('petImage');
      if (fileInput && fileInput.files[0]) {
        formData.append('petImage', fileInput.files[0]);
      }
      
      await axios.post('http://localhost:5000/api/foradoption', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Reset the form and close modal
      setNewPet({
        petName: '',
        petSpecies: 'Dog',
        petBreed: '',
        petAge: '',
        petGender: 'Male',
        vaccinated: false,
        neutered: false,
        specialNeeds: false,
        status: 'Available'
      });
      setShowAddPetModal(false);
      
      // Refresh pet list
      fetchPendingPets();
      fetchAdoptablePets();
      
    } catch (err) {
      console.error("Error adding pet:", err);
      alert("Failed to add pet. Please try again.");
    }
  };

  // Handle navigate to adoptable pets list
  const handleViewAdoptableList = () => {
    navigate('/info_adoptable_pet');
  };

  // Handle delete pet
  const handleDeletePet = async (petId) => {
    try {
      setDeleteLoading(true);
      await axios.delete(`http://localhost:5000/api/adoptablepets/${petId}`);
      
      // Remove the pet ID from hidden pets and save to localStorage
      setHiddenPetIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(petId);
        localStorage.setItem('hiddenPetIds', JSON.stringify([...newSet]));
        return newSet;
      });
      
      // Update both lists
      await Promise.all([
        fetchPendingPets(),
        fetchAdoptablePets()
      ]);

      setNotification({
        show: true,
        message: 'Pet removed from adoptable list successfully! 🗑️',
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
      setShowDeleteConfirm({ show: false, petId: null, petName: '' });
    } catch (err) {
      console.error("Error deleting pet:", err);
      setNotification({
        show: true,
        message: 'Failed to remove pet from adoptable list ❌',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCopyPet = async (petId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/movePet/${petId}`);
      
      // Add the pet ID to hidden pets and save to localStorage
      setHiddenPetIds(prev => {
        const newSet = new Set([...prev, petId]);
        localStorage.setItem('hiddenPetIds', JSON.stringify([...newSet]));
        return newSet;
      });
      
      // Update both lists
      await Promise.all([
        fetchPendingPets(),
        fetchAdoptablePets()
      ]);
      
      setNotification({
        show: true,
        message: 'Pet added to adoptable list successfully! 🐾',
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error(err);
      setNotification({
        show: true,
        message: 'Failed to add pet to adoptable list ❌',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Add Pet Modal
  const renderAddPetModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showAddPetModal ? '' : 'hidden'}`}>
      <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={() => setShowAddPetModal(false)}></div>
      <div className="bg-white rounded-lg shadow-xl p-6 z-10 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Pet</h2>
        <form onSubmit={handleAddPet}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Pet Name</label>
              <input 
                type="text" 
                name="petName" 
                value={newPet.petName} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Species</label>
              <select 
                name="petSpecies" 
                value={newPet.petSpecies} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Breed</label>
              <input 
                type="text" 
                name="petBreed" 
                value={newPet.petBreed} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Age (years)</label>
              <input 
                type="number" 
                name="petAge" 
                value={newPet.petAge} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Gender</label>
              <select 
                name="petGender" 
                value={newPet.petGender} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Pet Image</label>
              <input 
                type="file" 
                id="petImage"
                name="petImage" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                accept="image/*"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="vaccinated" 
                  checked={newPet.vaccinated} 
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Vaccinated</span>
              </label>
              
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="neutered" 
                  checked={newPet.neutered} 
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Neutered</span>
              </label>
              
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  name="specialNeeds" 
                  checked={newPet.specialNeeds} 
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span>Special Needs</span>
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setShowAddPetModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-white bg-gradient-to-r from-gray-500 to-gray-700 rounded-md hover:opacity-90"
            >
              Add Pet
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderPetList = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
            <Dog className="mr-3 text-gray-600" /> Pet Management
          </h2>
        </div>
        <div className="flex space-x-3">
          <button 
            className="flex items-center bg-gradient-to-r from-[#80533b] to-[#D08860] text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
            onClick={handleViewAdoptableList}
          >
            <Dog className="mr-2" /> View Public List
          </button>
        </div>
      </div>

      {/* Pet List View Toggle Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl shadow-md p-2 inline-flex">
          <button
            onClick={() => setPetListView('pending')}
            className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
              petListView === 'pending'
                ? 'bg-[#D08860] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Pending Adoption List</span>
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {pendingPets.filter(pet => !hiddenPetIds.has(pet._id) && !adoptedPetNames.has(pet.petName)).length}
            </span>
          </button>
          <button
            onClick={() => setPetListView('adoptable')}
            className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
              petListView === 'adoptable'
                ? 'bg-[#D08860] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Adoptable Pets List</span>
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {adoptablePets.length}
            </span>
          </button>
          <button
            onClick={() => setPetListView('adopted')}
            className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
              petListView === 'adopted'
                ? 'bg-[#D08860] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <HeartHandshake className="w-5 h-5" />
            <span>Adopted Pets List</span>
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {adoptedPets.length}
            </span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading pets...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
          {petListView === 'pending' ? (
            // Pending Adoption List
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPets.filter(pet => !hiddenPetIds.has(pet._id) && !adoptedPetNames.has(pet.petName)).length === 0 ? (
                <div className="col-span-3 text-center py-10 bg-white rounded-xl shadow-md">
                  <p className="text-gray-500">No pets in pending list</p>
                </div>
              ) : (
                pendingPets
                  .filter(pet => !hiddenPetIds.has(pet._id) && !adoptedPetNames.has(pet.petName))
                  .map((pet) => (
                    <div 
                      key={pet._id} 
                      className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl"
                    >
                      {/* Pet Image */}
                      {pet.petImage ? (
                        <img 
                          src={`http://localhost:5000${pet.petImage}`} 
                          alt={pet.petName} 
                          className="w-full h-128 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image available</span>
                        </div>
                      )}
                      
                      <div className="p-4">
                        {/* Pet Name & Status */}
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{pet.petName}</h3>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                            Pending
                          </span>
                        </div>

                        {/* Pet Information */}
                        <div className="text-gray-600">
                          <p>Species: {pet.petSpecies}</p>
                          <p>Breed: {pet.petBreed}</p>
                          <p>Age: {pet.petAge}</p>
                          <p>Gender: {pet.petGender}</p>
                        </div>

                        {/* Additional Information */}
                        <div className="mt-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${pet.vaccinated ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>Vaccinated: {pet.vaccinated ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${pet.neutered ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>Neutered: {pet.neutered ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${pet.specialNeeds ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                            <span>Special Needs: {pet.specialNeeds ? 'Yes' : 'No'}</span>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-4">
                          <button 
                            className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                            onClick={() => handleCopyPet(pet._id)}
                          >
                            <PlusCircle className="mr-2" size={18} />
                            Add to Adoptable List
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          ) : petListView === 'adoptable' ? (
            // Adoptable Pets List
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adoptablePets.filter(pet => !adoptedPetNames.has(pet.petName)).length === 0 ? (
                <div className="col-span-3 text-center py-10 bg-white rounded-xl shadow-md">
                  <p className="text-gray-500">No pets in adoptable list</p>
                </div>
              ) : (
                adoptablePets
                  .filter(pet => !adoptedPetNames.has(pet.petName))
                  .map((pet) => (
                    <div 
                      key={pet._id} 
                      className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl"
                    >
                      {/* Pet Image */}
                      {pet.petImage ? (
                        <img 
                          src={`http://localhost:5000${pet.petImage}`} 
                          alt={pet.petName} 
                          className="w-full h-128 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No image available</span>
                        </div>
                      )}
                      
                      <div className="p-4">
                        {/* Pet Name & Status */}
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{pet.petName}</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                            Available
                          </span>
                        </div>

                        {/* Pet Information */}
                        <div className="text-gray-600">
                          <p>Species: {pet.petSpecies}</p>
                          <p>Breed: {pet.petBreed}</p>
                          <p>Age: {pet.petAge} </p>
                          <p>Gender: {pet.petGender}</p>
                        </div>

                        {/* Additional Information */}
                        <div className="mt-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${pet.vaccinated ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>Vaccinated: {pet.vaccinated ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${pet.neutered ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>Neutered: {pet.neutered ? 'Yes' : 'No'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`w-3 h-3 rounded-full ${pet.specialNeeds ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                            <span>Special Needs: {pet.specialNeeds ? 'Yes' : 'No'}</span>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="mt-4 flex flex-col space-y-2">
                          <button 
                            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center"
                            onClick={() => setShowDeleteConfirm({ 
                              show: true, 
                              petId: pet._id, 
                              petName: pet.petName 
                            })}
                            disabled={deleteLoading}
                          >
                            <Trash2 className="mr-2" size={18} />
                            Remove from Adoptable List
                          </button>
                          <button
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                            onClick={() => handleAdoptedPet(pet._id)}
                            disabled={deleteLoading}
                          >
                            <HeartHandshake className="mr-2" size={18} />
                            Adopted Pet
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          ) : petListView === 'adopted' ? (
            // Adopted Pets List
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adoptedPets.length === 0 ? (
                <div className="col-span-3 text-center py-10 bg-white rounded-xl shadow-md">
                  <p className="text-gray-500">No pets in adopted list</p>
                </div>
              ) : (
                adoptedPets.map((pet) => (
                  <div
                    key={pet._id}
                    className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl"
                  >
                    {/* Pet Image */}
                    {pet.petImage ? (
                      <img
                        src={`http://localhost:5000${pet.petImage}`}
                        alt={pet.petName}
                        className="w-full h-128 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image available</span>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{pet.petName}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          Adopted
                        </span>
                      </div>
                      <div className="text-gray-600">
                        <p>Species: {pet.petSpecies}</p>
                        <p>Breed: {pet.petBreed}</p>
                        <p>Age: {pet.petAge}</p>
                        <p>Gender: {pet.petGender}</p>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${pet.vaccinated ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>Vaccinated: {pet.vaccinated ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${pet.neutered ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>Neutered: {pet.neutered ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`w-3 h-3 rounded-full ${pet.specialNeeds ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                          <span>Special Needs: {pet.specialNeeds ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                      {/* Owner Contact Information */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <h4 className="font-semibold text-gray-800 mb-2">Owner Contact Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{pet.email || 'No email provided'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">{pet.phone || 'No phone provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No pets available in this view
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderAdoptionForms = () => {
    // Get all scheduled home visits
    const scheduledVisits = homeVisits.filter(visit => visit.status === 'pending');
    const scheduledFormIds = new Set(scheduledVisits.map(visit => visit.adoptionFormId));

    return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
            <FileText className="mr-3 text-gray-600" /> New Adoption Applications
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading applications...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <div className="space-y-8">
                <div className="grid grid-cols-1 gap-6">
              {adoptionForms
                .filter(form => form.status === 'pending' && !scheduledFormIds.has(form._id))
                .length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl shadow-md">
                      <p className="text-gray-500">No new applications</p>
                    </div>
                  ) : (
                    adoptionForms
                  .filter(form => form.status === 'pending' && !scheduledFormIds.has(form._id))
                      .map((form) => (
                        <div 
                          key={form._id} 
                          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition"
                        >
                          <div className="flex flex-col md:flex-row gap-6">
                            {/* Left Section - Pet Image and Basic Info */}
                            <div className="flex-shrink-0">
                              <div className="relative w-40 h-40 rounded-xl overflow-hidden">
                                {form.petImage ? (
                                  <img 
                                    src={form.petImage.startsWith('http') ? form.petImage : `http://localhost:5000${form.petImage}`} 
                                    alt={form.petName} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Dog className="text-gray-400" size={32} />
                                  </div>
                                )}
                              </div>
                              <div className="mt-4 text-center">
                                <h3 className="text-xl font-bold text-gray-800">{form.petName}</h3>
                                <p className="text-gray-600">Pet Type: {form.petType}</p>
                              </div>
                            </div>

                            {/* Right Section - Form Details */}
                            <div className="flex-grow">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    {form.firstName} {form.lastName}
                                  </h3>
                                  <p className="text-gray-600">Email: {form.email}</p>
                                  <p className="text-gray-600">Phone: {form.phoneNumber}</p>
                                  <p className="text-gray-600">Submitted: {new Date(form.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Home Type: {form.homeType}</p>
                                  <p className="text-gray-600">Employment: {form.employmentStatus}</p>
                                  <p className="text-gray-600">
                                    <span className="font-semibold">Has Yard:</span> {form.hasYard ? 'Yes' : 'No'}
                                  </p>
                                  <p className="text-gray-600">
                                    <span className="font-semibold">Has Other Pets:</span> {form.hasOtherPets ? 'Yes' : 'No'}
                                  </p>
                                </div>
                              </div>

                              {form.additionalInfo && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                  <p className="text-gray-600">
                                    <span className="font-semibold">Additional Info:</span> {form.additionalInfo}
                                  </p>
                                </div>
                              )}

                              <div className="mt-4 flex justify-end space-x-3">
                                  <button 
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                                    onClick={() => handleScheduleVisit(form)}
                                  >
                                    <CalendarCheck className="inline-block" size={18} />
                                    <span>Schedule Visit</span>
                                  </button>
                            <button 
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
                              onClick={() => handleRejectApplication(form._id)}
                            >
                              <XCircle className="inline-block" size={18} />
                              <span>Reject Application</span>
                            </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
                                  </div>
                                )}
                              </div>
    );
  };

  const renderApplicationStatus = () => {
    // Get all visited home visits
    const visitedVisits = homeVisits.filter(visit => visit.status === 'visited');
    const visitedFormIds = new Set(visitedVisits.map(visit => visit.adoptionFormId));
    // For rejected: no need to check home visits

    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
            <FileText className="mr-3 text-gray-600" /> Visited Applications
          </h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl shadow-md p-2 inline-flex">
            <button
              onClick={() => setApplicationFilter('pending_review')}
              className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
                applicationFilter === 'pending_review'
                  ? 'bg-[#D08860] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Pending Review</span>
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {adoptionForms.filter(form => form.status === 'pending_review' && visitedFormIds.has(form._id)).length}
              </span>
            </button>
            <button
              onClick={() => setApplicationFilter('approved')}
              className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
                applicationFilter === 'approved'
                  ? 'bg-[#D08860] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Approved</span>
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {adoptionForms.filter(form => form.status === 'approved' && visitedFormIds.has(form._id)).length}
              </span>
            </button>
            <button
              onClick={() => setApplicationFilter('rejected')}
              className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
                applicationFilter === 'rejected'
                  ? 'bg-[#D08860] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <XCircle className="w-5 h-5" />
              <span>Rejected</span>
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {adoptionForms.filter(form => form.status === 'rejected').length}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {adoptionForms
            .filter(form => {
              if (applicationFilter === 'rejected') {
                return form.status === 'rejected';
              } else {
                return form.status === applicationFilter && visitedFormIds.has(form._id);
              }
            })
            .length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl shadow-md">
                <p className="text-gray-500">No {applicationFilter.replace('_', ' ')} applications with completed visits</p>
              </div>
            ) : (
              adoptionForms
                .filter(form => {
                  if (applicationFilter === 'rejected') {
                    return form.status === 'rejected';
                  } else {
                    return form.status === applicationFilter && visitedFormIds.has(form._id);
                  }
                })
                .map((form) => (
                  <div 
                    key={form._id} 
                    className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition ${
                      form._id === highlightedFormId ? 'ring-4 ring-[#D08860] animate-pulse' : ''
                    }`}
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left Section - Pet Image and Basic Info */}
                      <div className="flex-shrink-0">
                        <div className="relative w-40 h-40 rounded-xl overflow-hidden">
                          {form.petImage ? (
                            <img 
                              src={form.petImage.startsWith('http') ? form.petImage : `http://localhost:5000${form.petImage}`} 
                              alt={form.petName} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Dog className="text-gray-400" size={32} />
                            </div>
                          )}
                        </div>
                        <div className="mt-4 text-center">
                          <h3 className="text-xl font-bold text-gray-800">{form.petName}</h3>
                          <p className="text-gray-600">Pet Type: {form.petType}</p>
                        </div>
                      </div>

                      {/* Right Section - Form Details */}
                      <div className="flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                              {form.firstName} {form.lastName}
                            </h3>
                            <p className="text-gray-600">Email: {form.email}</p>
                            <p className="text-gray-600">Phone: {form.phoneNumber}</p>
                            <p className="text-gray-600">Submitted: {new Date(form.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Home Type: {form.homeType}</p>
                            <p className="text-gray-600">Employment: {form.employmentStatus}</p>
                            <p className="text-gray-600">
                              <span className="font-semibold">Has Yard:</span> {form.hasYard ? 'Yes' : 'No'}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-semibold">Has Other Pets:</span> {form.hasOtherPets ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>

                        {form.additionalInfo && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-600">
                              <span className="font-semibold">Additional Info:</span> {form.additionalInfo}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full ${
                              form.status === 'approved' 
                                ? 'bg-green-100 text-green-800' 
                                : form.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {form.status === 'pending_review' ? 'Pending Review' : form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                              Visit Completed
                            </span>
                          </div>

                          {form.status === 'pending_review' && (
                            <div className="flex space-x-3">
                              <button 
                                onClick={() => handleApproveApplication(form._id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                              >
                                <CheckCircle className="inline-block" size={18} />
                                <span>Approve Application</span>
                              </button>
                              <button
                                onClick={() => handleRejectApplication(form._id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
                              >
                                <XCircle className="inline-block" size={18} />
                                <span>Reject Application</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
        </div>
      </div>
    );
  };

  const renderHomeVisits = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <CalendarCheck className="mr-3 text-gray-600" /> Home Visits
        </h2>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl shadow-md p-2 inline-flex">
          <button
            onClick={() => setVisitFilter('all')}
            className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
              visitFilter === 'all'
                ? 'bg-[#D08860] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CalendarCheck className="w-5 h-5" />
            <span>All Visits</span>
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {homeVisits.length}
            </span>
          </button>
          <button
            onClick={() => setVisitFilter('pending')}
            className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
              visitFilter === 'pending'
                ? 'bg-[#D08860] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Pending Visits</span>
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {homeVisits.filter(visit => visit.status === 'pending').length}
            </span>
          </button>
          <button
            onClick={() => setVisitFilter('approved')}
            className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
              visitFilter === 'approved'
                ? 'bg-[#D08860] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Approved Visits</span>
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {homeVisits.filter(visit => visit.status === 'approved').length}
            </span>
          </button>
          <button
            onClick={() => setVisitFilter('rejected')}
            className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
              visitFilter === 'rejected'
                ? 'bg-[#D08860] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <XCircle className="w-5 h-5" />
            <span>Rejected Visits</span>
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {homeVisits.filter(visit => visit.status === 'rejected').length}
            </span>
          </button>
          <button
            onClick={() => setVisitFilter('visited')}
            className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
              visitFilter === 'visited'
                ? 'bg-[#D08860] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Visited</span>
            <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
              {homeVisits.filter(visit => visit.status === 'visited').length}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {visitFilter === 'all' ? (
          <>
            {/* Pending Visits Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Clock className="mr-2 text-yellow-500" />
                Pending Visits
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  {homeVisits.filter(visit => visit.status === 'pending').length}
                </span>
              </h3>
              <div className="space-y-4">
                {homeVisits
                  .filter(visit => visit.status === 'pending')
                  .map(visit => (
                    <div 
                      key={visit._id} 
                      className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-yellow-100 p-3 rounded-full">
                          <Home className="text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{visit.petName} Adoption</h3>
                          <p className="text-gray-600">
                            Adopter: {visit.adopterName} | {visit.date ? new Date(visit.date).toLocaleDateString() : 'Date not set'}
                          </p>
                          <p className="text-gray-600">
                            Email: {visit.adopterEmail}
                          </p>
                          {visit.userResponse && (
                            <div className="mt-2">
                              <p className="text-gray-600">
                                <span className="font-semibold">User Response:</span>{' '}
                                <span className={`${
                                  visit.userResponse === 'accepted' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {visit.userResponse.charAt(0).toUpperCase() + visit.userResponse.slice(1)}
                                </span>
                              </p>
                              {visit.userNotes && (
                                <p className="text-gray-600 mt-1">
                                  <span className="font-semibold">User Notes:</span> {visit.userNotes}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {visit.userResponse === 'accepted' && (
                          <button
                            onClick={() => handleMarkAsVisited(visit._id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                          >
                            <CheckCircle className="inline-block" size={18} />
                            <span>Mark as Visited</span>
                          </button>
                        )}
                        <span className={`px-3 py-1 rounded-full ${
                          visit.userResponse === 'accepted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {visit.userResponse ? 
                            visit.userResponse.charAt(0).toUpperCase() + visit.userResponse.slice(1) 
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Approved Visits Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle2 className="mr-2 text-green-500" />
                Approved Visits
                <span className="ml-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {homeVisits.filter(visit => visit.status === 'approved').length}
                </span>
              </h3>
              <div className="space-y-4">
                {homeVisits
                  .filter(visit => visit.status === 'approved')
                  .map(visit => (
                    <div 
                      key={visit._id} 
                      className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Home className="text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{visit.petName} Adoption</h3>
                          <p className="text-gray-600">
                            Adopter: {visit.adopterName} | {visit.date ? new Date(visit.date).toLocaleDateString() : 'Date not set'}
                          </p>
                          <p className="text-gray-600">
                            Email: {visit.adopterEmail}
                          </p>
                          {visit.userNotes && (
                            <p className="text-gray-600 mt-1">
                              <span className="font-semibold">User Notes:</span> {visit.userNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleMarkAsVisited(visit._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                        >
                          <CheckCircle className="inline-block" size={18} />
                          <span>Mark as Visited</span>
                        </button>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          Approved
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Visited Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="mr-2 text-blue-500" />
                Completed Visits
                <span className="ml-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {homeVisits.filter(visit => visit.status === 'visited').length}
                </span>
              </h3>
              <div className="space-y-4">
                {homeVisits
                  .filter(visit => visit.status === 'visited')
                  .map(visit => (
                    <div 
                      key={visit._id} 
                      className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Home className="text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{visit.petName} Adoption</h3>
                          <p className="text-gray-600">
                            Adopter: {visit.adopterName} | {visit.date ? new Date(visit.date).toLocaleDateString() : 'Date not set'}
                          </p>
                          <p className="text-gray-600">
                            Email: {visit.adopterEmail}
                          </p>
                          {visit.notes && (
                            <p className="text-gray-600 mt-1">
                              <span className="font-semibold">Visit Notes:</span> {visit.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        Visit Completed
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Rejected Visits Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <XCircle className="mr-2 text-red-500" />
                Rejected Visits
                <span className="ml-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                  {homeVisits.filter(visit => visit.status === 'rejected').length}
                </span>
              </h3>
              <div className="space-y-4">
                {homeVisits
                  .filter(visit => visit.status === 'rejected')
                  .map(visit => (
                    <div 
                      key={visit._id} 
                      className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-red-100 p-3 rounded-full">
                          <Home className="text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{visit.petName} Adoption</h3>
                          <p className="text-gray-600">
                            Adopter: {visit.adopterName} | {visit.date ? new Date(visit.date).toLocaleDateString() : 'Date not set'}
                          </p>
                          <p className="text-gray-600">
                            Email: {visit.adopterEmail}
                          </p>
                          {visit.userNotes && (
                            <p className="text-gray-600 mt-1">
                              <span className="font-semibold">User Notes:</span> {visit.userNotes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
                          Rejected
                        </span>
                        <button
                          onClick={() => handleRescheduleVisit(visit)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                        >
                          <CalendarCheck className="inline-block" size={18} />
                          <span>Reschedule Visit</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {homeVisits
              .filter(visit => visit.status === visitFilter)
              .map(visit => (
                <div 
                  key={visit._id} 
                  className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg transition"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      visit.status === 'pending' ? 'bg-yellow-100' :
                      visit.status === 'visited' ? 'bg-blue-100' :
                      visit.status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <Home className={
                        visit.status === 'pending' ? 'text-yellow-600' :
                        visit.status === 'visited' ? 'text-blue-600' :
                        visit.status === 'approved' ? 'text-green-600' : 'text-red-600'
                      } />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{visit.petName} Adoption</h3>
                      <p className="text-gray-600">
                        Adopter: {visit.adopterName} | {visit.date ? new Date(visit.date).toLocaleDateString() : 'Date not set'}
                      </p>
                      <p className="text-gray-600">
                        Email: {visit.adopterEmail}
                      </p>
                      {visit.notes && (
                        <p className="text-gray-600 mt-1">
                          <span className="font-semibold">Visit Notes:</span> {visit.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {visit.status === 'approved' && (
                      <button
                        onClick={() => handleMarkAsVisited(visit._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition flex items-center space-x-2"
                      >
                        <CheckCircle className="inline-block" size={18} />
                        <span>Mark as Visited</span>
                      </button>
                    )}
                    {visit.status === 'rejected' && (
                      <button
                        onClick={() => handleRescheduleVisit(visit)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
                      >
                        <CalendarCheck className="inline-block" size={18} />
                        <span>Reschedule Visit</span>
                      </button>
                    )}
                    <span className={`px-3 py-1 rounded-full ${
                      visit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      visit.status === 'visited' ? 'bg-blue-100 text-blue-800' :
                      visit.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderLostFoundPets = () => (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <MapPin className="mr-3 text-gray-600" /> Lost & Found Pets
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setLostFoundSection('lost')}
            className={`px-4 py-2 rounded-lg transition-all ${
              lostFoundSection === 'lost'
                ? 'bg-[#D08860] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Lost Pets ({lostPets.length})
          </button>
          <button
            onClick={() => setLostFoundSection('found')}
            className={`px-4 py-2 rounded-lg transition-all ${
              lostFoundSection === 'found'
                ? 'bg-[#D08860] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Found Pets ({foundPets.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D08860]"></div>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(lostFoundSection === 'lost' ? lostPets : foundPets).length === 0 ? (
            <div className="col-span-3 text-center py-10 text-gray-500">
              No {lostFoundSection} pets available
            </div>
          ) : (
            (lostFoundSection === 'lost' ? lostPets : foundPets).map((pet) => (
              <div
                key={pet._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105"
              >
                <div className="relative pt-[125%]">
                  {pet.image ? (
                    <img
                      src={`http://localhost:5000/uploads/${pet.image}`}
                      alt={pet.petName}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                      }}
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
                      {lostFoundSection === 'lost' ? 'Last Seen Location:' : 'Found Location:'}
                    </span>{' '}
                    {lostFoundSection === 'lost' ? pet.lastSeenLocation : pet.foundLocation}
                  </p>
                  <p className="text-gray-600 mb-4">
                    <span className="font-medium">
                      {lostFoundSection === 'lost' ? 'Last Seen Date:' : 'Found Date:'}
                    </span>{' '}
                    {new Date(lostFoundSection === 'lost' ? pet.lastSeenDate : pet.foundDate).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDeleteLostFoundPet(pet._id, lostFoundSection)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

  const renderReports = () => {
    // Calculate statistics
    const totalPets = pendingPets.length + adoptablePets.length;
    const totalAdopted = adoptedPets.length;
    const adoptionRate = totalPets > 0 ? ((totalAdopted / totalPets) * 100).toFixed(1) : 0;
    
    const totalVisits = homeVisits.length;
    const completedVisits = homeVisits.filter(v => v.status === 'visited').length;
    const visitCompletionRate = totalVisits > 0 ? ((completedVisits / totalVisits) * 100).toFixed(1) : 0;
    
    const totalApplications = adoptionForms.length;
    const approvedApplications = adoptionForms.filter(f => f.status === 'approved').length;
    const applicationApprovalRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(1) : 0;

    // Calculate monthly statistics
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Count adopted pets in the current month
    const monthlyAdoptedPets = adoptedPets.filter(pet => {
      const adoptionDate = new Date(pet.adoptionDate);
      return adoptionDate.getMonth() === currentMonth && adoptionDate.getFullYear() === currentYear;
    }).length;
    // Count approved applications in the current month
    const monthlyApprovedApplications = adoptionForms.filter(form => {
      return form.status === 'approved' && new Date(form.createdAt).getMonth() === currentMonth && new Date(form.createdAt).getFullYear() === currentYear;
    }).length;
    // Monthly adoptions = adopted pets + approved applications (if not already counted)
    const monthlyAdoptions = monthlyAdoptedPets + monthlyApprovedApplications;

    const monthlyVisits = homeVisits.filter(visit => {
      const visitDate = new Date(visit.date);
      return visitDate.getMonth() === currentMonth && visitDate.getFullYear() === currentYear;
    }).length;

    // Calculate Lost and Found statistics
    const totalLostPets = lostPets.length;
    const totalFoundPets = foundPets.length;
    const monthlyLostPets = lostPets.filter(pet => {
      const lostDate = new Date(pet.lastSeenDate);
      return lostDate.getMonth() === currentMonth && lostDate.getFullYear() === currentYear;
    }).length;
    const monthlyFoundPets = foundPets.filter(pet => {
      const foundDate = new Date(pet.foundDate);
      return foundDate.getMonth() === currentMonth && foundDate.getFullYear() === currentYear;
    }).length;

    // Calculate pet type distribution for lost and found
    const lostPetTypes = lostPets.reduce((acc, pet) => {
      acc[pet.petType] = (acc[pet.petType] || 0) + 1;
      return acc;
    }, {});

    const foundPetTypes = foundPets.reduce((acc, pet) => {
      acc[pet.petType] = (acc[pet.petType] || 0) + 1;
      return acc;
    }, {});

    // Download adoption coordinator report as PDF
    const handleDownloadCoordinatorReport = () => {
      const doc = new jsPDF();
      doc.setFillColor(208, 136, 96); // #D08860
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text('Adoption Coordinator Report', 105, 20, { align: 'center' });
      doc.setTextColor(60, 40, 27);
      doc.setFontSize(14);
      let y = 40;
      doc.text('Key Statistics:', 14, y); y += 10;
      doc.setFontSize(12);
      doc.text(`Total Pets: ${pendingPets.length + adoptablePets.length}`, 14, y); y += 8;
      doc.text(`Adopted Pets: ${adoptedPets.length}`, 14, y); y += 8;
      doc.text(`Adoption Rate: ${totalPets > 0 ? ((adoptedPets.length / (pendingPets.length + adoptablePets.length)) * 100).toFixed(1) : 0}%`, 14, y); y += 8;
      doc.text(`Home Visits: ${homeVisits.length}`, 14, y); y += 8;
      doc.text(`Completed Visits: ${homeVisits.filter(v => v.status === 'visited').length}`, 14, y); y += 8;
      doc.text(`Visit Completion Rate: ${homeVisits.length > 0 ? ((homeVisits.filter(v => v.status === 'visited').length / homeVisits.length) * 100).toFixed(1) : 0}%`, 14, y); y += 8;
      doc.text(`Applications: ${adoptionForms.length}`, 14, y); y += 8;
      doc.text(`Approved Applications: ${adoptionForms.filter(f => f.status === 'approved').length}`, 14, y); y += 8;
      doc.text(`Application Approval Rate: ${adoptionForms.length > 0 ? ((adoptionForms.filter(f => f.status === 'approved').length / adoptionForms.length) * 100).toFixed(1) : 0}%`, 14, y); y += 12;
      doc.setFontSize(14);
      doc.text('Monthly Statistics:', 14, y); y += 10;
      doc.setFontSize(12);
      doc.text(`Monthly Adoptions: ${monthlyAdoptions}`, 14, y); y += 8;
      doc.text(`Monthly Home Visits: ${monthlyVisits}`, 14, y); y += 12;
      doc.setFontSize(14);
      doc.text('Lost & Found:', 14, y); y += 10;
      doc.setFontSize(12);
      doc.text(`Total Lost Pets: ${lostPets.length}`, 14, y); y += 8;
      doc.text(`Total Found Pets: ${foundPets.length}`, 14, y); y += 8;
      doc.save('Adoption_Coordinator_Report.pdf');
    };

    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-6 flex items-center">
            <FileText className="mr-3 text-gray-600" /> Adoption Coordinator Reports
          </h2>
          <button
            onClick={handleDownloadCoordinatorReport}
            className="flex items-center gap-2 px-5 py-2 bg-[#D08860] text-white rounded-lg shadow hover:bg-[#80533b] transition-colors font-semibold"
          >
            <FileText size={18} />
            Download Report
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 transform transition-all hover:scale-105">
            <div className="flex justify-between items-center">
              <HeartHandshake className="text-[#D08860]" size={40} />
              <span className="text-3xl font-bold text-gray-700">{totalPets}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Total Pets</h3>
            <div className="h-2 w-full bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-[#D08860] rounded-full" 
                style={{ width: '100%' }}
              ></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 transform transition-all hover:scale-105">
            <div className="flex justify-between items-center">
              <CheckCircle2 className="text-green-500" size={40} />
              <span className="text-3xl font-bold text-green-700">{totalAdopted}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Adopted Pets</h3>
            <div className="h-2 w-full bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full" 
                style={{ width: `${adoptionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Adoption Rate: {adoptionRate}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 transform transition-all hover:scale-105">
            <div className="flex justify-between items-center">
              <CalendarCheck className="text-blue-500" size={40} />
              <span className="text-3xl font-bold text-blue-700">{totalVisits}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Home Visits</h3>
            <div className="h-2 w-full bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: `${visitCompletionRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Completion Rate: {visitCompletionRate}%</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 transform transition-all hover:scale-105">
            <div className="flex justify-between items-center">
              <FileText className="text-purple-500" size={40} />
              <span className="text-3xl font-bold text-purple-700">{totalApplications}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Applications</h3>
            <div className="h-2 w-full bg-gray-100 rounded-full">
              <div 
                className="h-2 bg-purple-500 rounded-full" 
                style={{ width: `${applicationApprovalRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Approval Rate: {applicationApprovalRate}%</p>
          </div>
        </div>

        {/* Monthly Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="mr-2 text-[#D08860]" />
              This Month's Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Monthly Adoptions</span>
                <span className="text-2xl font-bold text-[#D08860]">{monthlyAdoptions}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Monthly Home Visits</span>
                <span className="text-2xl font-bold text-blue-500">{monthlyVisits}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="mr-2 text-[#D08860]" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Average Processing Time</span>
                <span className="text-2xl font-bold text-[#D08860]">3.5 days</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Visit Success Rate</span>
                <span className="text-2xl font-bold text-green-500">{visitCompletionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <PieChart className="mr-2 text-[#D08860]" />
              Application Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold">{adoptionForms.filter(f => f.status === 'pending').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Approved</span>
                <span className="font-semibold text-green-600">{approvedApplications}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected</span>
                <span className="font-semibold text-red-600">{adoptionForms.filter(f => f.status === 'rejected').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Home className="mr-2 text-[#D08860]" />
              Visit Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold">{homeVisits.filter(v => v.status === 'pending').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <span className="font-semibold text-green-600">{completedVisits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected</span>
                <span className="font-semibold text-red-600">{homeVisits.filter(v => v.status === 'rejected').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Dog className="mr-2 text-[#D08860]" />
              Pet Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available</span>
                <span className="font-semibold">{adoptablePets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Review</span>
                <span className="font-semibold text-yellow-600">{pendingPets.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Adopted</span>
                <span className="font-semibold text-green-600">{totalAdopted}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lost and Found Reports */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <MapPin className="mr-2 text-[#D08860]" />
            Lost & Found Reports
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Total Lost Pets</h4>
                <span className="text-3xl font-bold text-red-500">{totalLostPets}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div 
                  className="h-2 bg-red-500 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Total Found Pets</h4>
                <span className="text-3xl font-bold text-green-500">{totalFoundPets}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Monthly Lost</h4>
                <span className="text-3xl font-bold text-red-500">{monthlyLostPets}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div 
                  className="h-2 bg-red-500 rounded-full" 
                  style={{ width: `${(monthlyLostPets / Math.max(1, totalLostPets)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Monthly Found</h4>
                <span className="text-3xl font-bold text-green-500">{monthlyFoundPets}</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full">
                <div 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ width: `${(monthlyFoundPets / Math.max(1, totalFoundPets)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Dog className="mr-2 text-[#D08860]" />
                Lost Pets by Type
              </h4>
              <div className="space-y-3">
                {Object.entries(lostPetTypes).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-600">{type}</span>
                    <div className="flex items-center">
                      <span className="font-semibold text-red-500 mr-2">{count}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full">
                        <div 
                          className="h-2 bg-red-500 rounded-full" 
                          style={{ width: `${(count / totalLostPets) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Dog className="mr-2 text-[#D08860]" />
                Found Pets by Type
              </h4>
              <div className="space-y-3">
                {Object.entries(foundPetTypes).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-gray-600">{type}</span>
                    <div className="flex items-center">
                      <span className="font-semibold text-green-500 mr-2">{count}</span>
                      <div className="w-24 h-2 bg-gray-100 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ width: `${(count / totalFoundPets) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Notification = ({ message, type }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`
        animate-fade-in
        px-8 py-4 rounded-xl shadow-2xl 
        flex items-center gap-3
        backdrop-blur-sm
        ${type === 'success' 
          ? 'bg-green-500/90 text-white ring-2 ring-green-400' 
          : 'bg-red-500/90 text-white ring-2 ring-red-400'}
        transform transition-all duration-300 ease-out
        min-w-[300px] justify-center
      `}>
        {type === 'success' ? (
          <CheckCircle className="h-6 w-6 flex-shrink-0" />
        ) : (
          <XCircle className="h-6 w-6 flex-shrink-0" />
        )}
        <span className="font-semibold text-lg text-center">{message}</span>
      </div>
    </div>
  );

  // Add this new component for the delete confirmation modal
  const DeleteConfirmationModal = ({ petName, onConfirm, onCancel }) => (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel}></div>
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 z-50 transform transition-all">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 mx-auto mb-4 flex items-center justify-center">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Removal</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to remove <span className="font-semibold text-gray-800">{petName}</span> from the adoptable list?
          </p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Remove Pet
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const handleApproveApplication = async (formId) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/adoptionform/update/${formId}`,
        { status: 'approved' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchAdoptionForms();
      setNotification({
        show: true,
        message: 'Application approved successfully',
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error approving application:', error);
      setNotification({
        show: true,
        message: 'Failed to approve application',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleRejectApplication = async (formId) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      // Reject the application
      await axios.put(
        `http://localhost:5000/api/adoptionform/update/${formId}`,
        { status: 'rejected' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // Also update all related home visits to rejected
      await axios.put(
        `http://localhost:5000/api/homevisits/by-form/${formId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchAdoptionForms();
      fetchHomeVisits();
      setNotification({
        show: true,
        message: 'Application rejected successfully',
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error rejecting application:', error);
      setNotification({
        show: true,
        message: 'Failed to reject application',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleScheduleVisit = async (form) => {
    setSelectedForm(form);
    setIsRescheduling(false);
    setShowAddVisitModal(true);
  };

  const handleRescheduleVisit = async (visit) => {
    try {
      setSelectedForm({
        _id: visit.adoptionFormId,
        firstName: visit.adopterName.split(' ')[0],
        lastName: visit.adopterName.split(' ').slice(1).join(' '),
        email: visit.adopterEmail,
        petName: visit.petName
      });
      setVisitDate('');
      setVisitTime('');
      setVisitNotes('');
      setIsRescheduling(true);
      setShowAddVisitModal(true);
    } catch (error) {
      console.error('Error preparing reschedule:', error);
      setNotification({
        show: true,
        message: 'Failed to prepare rescheduling',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  const handleSubmitVisit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        setNotification({
          show: true,
          message: 'Authentication required. Please log in again.',
          type: 'error'
        });
        return;
      }

      const visitData = {
        adoptionFormId: selectedForm._id,
        adopterName: `${selectedForm.firstName} ${selectedForm.lastName}`,
        adopterEmail: selectedForm.email,
        petName: selectedForm.petName,
        date: new Date(`${visitDate}T${visitTime}`),
        notes: visitNotes,
        status: 'pending'
      };

      console.log('Submitting visit data:', visitData); // Debug log

      const response = await axios.post(
        'http://localhost:5000/api/homevisits',
        visitData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Visit response:', response.data); // Debug log

      // Reset form and close modal
      setVisitDate('');
      setVisitTime('');
      setVisitNotes('');
      setShowAddVisitModal(false);
      setSelectedForm(null);

      // Refresh visits list
      await fetchHomeVisits();
      
      setNotification({
        show: true,
        message: 'Home visit scheduled successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error scheduling visit:', error);
      setNotification({
        show: true,
        message: error.response?.data?.message || 'Failed to schedule home visit',
        type: 'error'
      });
    } finally {
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Update the renderVisitSchedulingModal function
  const renderVisitSchedulingModal = () => (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${showAddVisitModal ? '' : 'hidden'}`}>
      <div className="absolute inset-0 bg-gray-900 opacity-50" onClick={() => setShowAddVisitModal(false)}></div>
      <div className="bg-white rounded-xl shadow-2xl p-6 z-10 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isRescheduling ? 'Reschedule Home Visit' : 'Schedule Home Visit'}
        </h2>
        <form onSubmit={handleSubmitVisit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Adopter Name</label>
              <input 
                type="text" 
                value={selectedForm ? `${selectedForm.firstName} ${selectedForm.lastName}` : ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Pet Name</label>
              <input 
                type="text" 
                value={selectedForm?.petName || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Visit Date</label>
              <input 
                type="date" 
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                min={new Date().toISOString().split('T')[0]} // Set minimum date to today
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Visit Time</label>
              <input 
                type="time" 
                value={visitTime}
                onChange={(e) => setVisitTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Notes</label>
              <textarea 
                value={visitNotes}
                onChange={(e) => setVisitNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
                placeholder="Any special instructions or notes for the visit..."
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setShowAddVisitModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-white bg-gradient-to-r from-gray-500 to-gray-700 rounded-md hover:opacity-90"
            >
              {isRescheduling ? 'Reschedule Visit' : 'Schedule Visit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Add this CSS animation at the top of your file after the imports
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in {
      0% { opacity: 0; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }
  `;
  document.head.appendChild(style);

  // Update the delete handler
  const handleDeleteLostFoundPet = async (petId, type) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!token) {
        setNotification({
          show: true,
          message: 'Authentication required. Please log in again.',
          type: 'error'
        });
        setTimeout(() => {
          setNotification({ show: false, message: '', type: '' });
        }, 3000);
        return;
      }

      if (!window.confirm(`Are you sure you want to delete this ${type} pet report?`)) {
        return;
      }

      console.log(`Deleting ${type} pet with ID:`, petId);
      await axios.delete(`http://localhost:5000/api/lost-and-found/${type}/${petId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (type === 'lost') {
        setLostPets(lostPets.filter(pet => pet._id !== petId));
      } else {
        setFoundPets(foundPets.filter(pet => pet._id !== petId));
      }
      
      setNotification({
        show: true,
        message: `${type === 'lost' ? 'Lost' : 'Found'} pet removed successfully! 🗑️`,
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error(`Error deleting ${type} pet:`, error);
      setNotification({
        show: true,
        message: error.response?.data?.message || `Failed to remove ${type} pet ❌`,
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Add cleanup on component unmount
  useEffect(() => {
    return () => {
      // Save hidden pet IDs to localStorage when component unmounts
      localStorage.setItem('hiddenPetIds', JSON.stringify([...hiddenPetIds]));
    };
  }, [hiddenPetIds]);

  const handleUpdateVisitStatus = async (visitId, status) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/homevisits/${visitId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      fetchHomeVisits();
      setNotification({
        show: true,
        message: `Visit ${status} successfully`,
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating visit status:', error);
      setNotification({
        show: true,
        message: 'Failed to update visit status',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Add this new handler function after handleUpdateVisitStatus
  const handleMarkAsVisited = async (visitId) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      // First, get the visit details to find the associated adoption form
      const visit = homeVisits.find(v => v._id === visitId);
      if (!visit || !visit.adoptionFormId) {
        throw new Error('Visit or adoption form not found');
      }

      // Update the visit status to visited
      await axios.put(
        `http://localhost:5000/api/homevisits/${visitId}`,
        { status: 'visited' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Update the adoption form status to pending review
      await axios.put(
        `http://localhost:5000/api/adoptionform/update/${visit.adoptionFormId}`,
        { status: 'pending_review' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Refresh both home visits and adoption forms
      await Promise.all([
        fetchHomeVisits(),
        fetchAdoptionForms()
      ]);

      // Set the highlighted form ID and switch to Application Status section
      setHighlightedFormId(visit.adoptionFormId);
      setActiveSection('status');
      setApplicationFilter('pending_review');

      setNotification({
        show: true,
        message: 'Home visit marked as completed',
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error marking visit as completed:', error);
      setNotification({
        show: true,
        message: 'Failed to update visit status',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    }
  };

  // Add this effect to clear the highlighted form after 5 seconds
  useEffect(() => {
    if (highlightedFormId) {
      const timer = setTimeout(() => {
        setHighlightedFormId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightedFormId]);

  // Add handler to move pet to adopted
  const handleAdoptedPet = async (petId) => {
    try {
      setDeleteLoading(true);
      await axios.post(`http://localhost:5000/api/adoptedpets/move/${petId}`);
      await Promise.all([
        fetchAdoptablePets(),
        fetchAdoptedPets(),
      ]);
      setNotification({
        show: true,
        message: 'Pet marked as adopted! 🎉',
        type: 'success'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } catch (err) {
      console.error('Error moving pet to adopted:', err);
      setNotification({
        show: true,
        message: 'Failed to mark pet as adopted ❌',
        type: 'error'
      });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
      }, 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const adoptedPetNames = new Set(adoptedPets.map(pet => pet.petName));

  // Update the setActiveSection handler
  const handleSectionChange = (section) => {
    setActiveSection(section);
    localStorage.setItem('activeSection', section);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-[#80533b] to-[#D08860] shadow-2xl flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-white/20 flex items-center">
            <PawPrint className="mr-3 text-white" size={40} />
            <h1 className="text-2xl font-bold text-white">Pawsome Adoptions</h1>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {[
                { 
                  name: 'Pets', 
                  icon: Dog, 
                  section: 'pets',
                  color: 'hover:bg-[#D08860]/20' 
                },
                { 
                  name: 'Adoption Forms', 
                  icon: FileText, 
                  section: 'forms',
                  color: 'hover:bg-[#D08860]/20' 
                },
                { 
                  name: 'Home Visits', 
                  icon: CalendarCheck, 
                  section: 'visits',
                  color: 'hover:bg-[#D08860]/20' 
                },
                { 
                  name: 'Application Status', 
                  icon: CheckCircle2, 
                  section: 'status',
                  color: 'hover:bg-[#D08860]/20' 
                },
                { 
                  name: 'Lost & Found', 
                  icon: MapPin, 
                  section: 'lostfound',
                  color: 'hover:bg-[#D08860]/20' 
                },
                { 
                  name: 'Reports', 
                  icon: FileText, 
                  section: 'reports',
                  color: 'hover:bg-[#D08860]/20' 
                }
              ].map(item => (
                <li 
                  key={item.section}
                  className={
                    `flex items-center p-3 rounded-lg cursor-pointer ${
                      activeSection === item.section 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/90 ' + item.color
                    } transition-all duration-300`
                  }
                  onClick={() => handleSectionChange(item.section)}
                >
                  <item.icon className="mr-3" />
                  {item.name}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        {/* Logout Button */}
        <div className="p-4 mb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all font-semibold text-lg"
          >
            <LogOut className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'pets' && renderPetList()}
        {activeSection === 'forms' && renderAdoptionForms()}
        {activeSection === 'visits' && renderHomeVisits()}
        {activeSection === 'status' && renderApplicationStatus()}
        {activeSection === 'lostfound' && renderLostFoundPets()}
        {activeSection === 'reports' && renderReports()}
      </div>

      {/* Add Pet Modal */}
      {renderAddPetModal()}
      
      {/* Visit Scheduling Modal */}
      {renderVisitSchedulingModal()}
      
      {/* Notification */}
      {notification.show && (
        <Notification message={notification.message} type={notification.type} />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <DeleteConfirmationModal
          petName={showDeleteConfirm.petName}
          onConfirm={() => handleDeletePet(showDeleteConfirm.petId)}
          onCancel={() => setShowDeleteConfirm({ show: false, petId: null, petName: '' })}
        />
      )}
    </div>
  );
};

export default PetAdoptionCoordinatorDashboard;