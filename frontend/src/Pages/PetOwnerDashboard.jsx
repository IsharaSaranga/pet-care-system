import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Heart, 
  Edit, 
  Trash2, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle,
  Dog,
  Cat,
  Bird,
  Rabbit,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Shield,
  Syringe,
  Scissors,
  Info
} from 'lucide-react';
import jsPDF from 'jspdf';

const PetOwnerDashboard = () => {
  const [pets, setPets] = useState([]);
  const [adoptablePets, setAdoptablePets] = useState([]);
  const [adoptedPets, setAdoptedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, petId: null });
  const navigate = useNavigate();

  // Get token and user data from localStorage
  const token = localStorage.getItem('petOwnerToken');
  const userData = JSON.parse(localStorage.getItem('petOwnerUser') || '{}');
  const userId = userData._id;
  console.log('User data from localStorage:', userData);
  console.log('UserId from localStorage:', userId);

  // Fetch adoptable pets to check status
  const fetchAdoptablePets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/adoptablepets');
      setAdoptablePets(response.data);
    } catch (err) {
      console.error("Error fetching adoptable pets:", err);
    }
  };

  // Fetch pet owner's adoption forms
  const fetchPets = async () => {
    try {
      setLoading(true);
      console.log('Fetching pets for userId:', userId);
      // Get pets for the specific user using the owner endpoint
      const response = await axios.get(`http://localhost:5000/api/foradoption/owner/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Response from server:', response.data);
      setPets(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching pets:", err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setError("Failed to load your pet listings");
    } finally {
      setLoading(false);
    }
  };

  // Fetch adopted pets
  const fetchAdoptedPets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/adoptedpets');
      setAdoptedPets(response.data);
    } catch (err) {
      console.error("Error fetching adopted pets:", err);
    }
  };

  useEffect(() => {
    if (!token || !userId) {
      // If no token or userId is found, redirect to login
      navigate('/login');
      return;
    }
    fetchPets();
    fetchAdoptablePets();
    fetchAdoptedPets();
  }, [token, userId, navigate]);

  // Handle delete confirmation
  const handleDeleteClick = (petId) => {
    setShowDeleteConfirm({ show: true, petId });
  };

  // Handle actual deletion
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/foradoption/${showDeleteConfirm.petId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowDeleteConfirm({ show: false, petId: null });
      fetchPets(); // Refresh the list
    } catch (err) {
      console.error("Error deleting pet:", err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setError("Failed to delete pet listing");
    }
  };

  // Navigate to edit form
  const handleEditClick = (petId) => {
    navigate(`/edit-pet/${petId}`);
  };

  // Navigate to add new pet form
  const handleAddNewPet = () => {
    navigate('/add_adoptable_pet');
  };

  // Function to get the appropriate pet icon based on species
  const getPetIcon = (species) => {
    switch (species.toLowerCase()) {
      case 'dog':
        return <Dog className="w-5 h-5" />;
      case 'cat':
        return <Cat className="w-5 h-5" />;
      case 'bird':
        return <Bird className="w-5 h-5" />;
      case 'rabbit':
        return <Rabbit className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  // Function to check if a pet is in the adoptable list
  const isPetAdoptable = (petId) => {
    return adoptablePets.some(pet => pet.originalPetId === petId || pet._id === petId);
  };

  // Helper to check if pet is adopted
  const isPetAdopted = (petId) => {
    return adoptedPets.some(pet => pet.originalPetId === petId || pet._id === petId);
  };

  // Function to get status message based on pet status
  const getStatusMessage = (petId) => {
    if (isPetAdopted(petId)) {
      return {
        message: "Your pet has been successfully adopted! Please bring your pet to our shelter within 48 hours to complete the adoption process.",
        type: "success",
        icon: <CheckCircle className="w-5 h-5" />
      };
    } else if (isPetAdoptable(petId)) {
      return {
        message: "Your pet is available for adoption. Potential adopters can now view and apply to adopt your pet.",
        type: "info",
        icon: <Info className="w-5 h-5" />
      };
    } else {
      return {
        message: "Your pet is pending review by the adoption coordinator. We will notify you once the review is complete.",
        type: "warning",
        icon: <AlertCircle className="w-5 h-5" />
      };
    }
  };

  // Download adoption report as PDF
  const handleDownloadReport = (pet) => {
    const doc = new jsPDF();
    // Header with color
    doc.setFillColor(208, 136, 96); // #D08860
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Adoption Report', 105, 20, { align: 'center' });
    doc.setTextColor(60, 40, 27); // #3C281B
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Pet Name:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.petName || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Breed:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.petBreed || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Species:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.petSpecies || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Age:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.petAge || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Gender:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.petGender || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Vaccinated:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.vaccinated ? 'Yes' : 'No'}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Neutered:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.neutered ? 'Yes' : 'No'}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Special Needs:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.specialNeeds ? 'Yes' : 'No'}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Status:`, 14, y); doc.setFont('helvetica', 'bold'); doc.setTextColor(0, 128, 255); doc.text(`Adopted`, 50, y); doc.setTextColor(60, 40, 27); doc.setFont('helvetica', 'normal'); y += 12;
    doc.text(`Owner Name:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.ownerFirstName || ''} ${pet.ownerLastName || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Owner Email:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.email || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Owner Phone:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${pet.phone || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 12;
    if (pet.petDescription) {
      doc.setFont('helvetica', 'bold');
      doc.text('Description:', 14, y); y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(pet.petDescription, 180), 14, y); y += 12;
      doc.setTextColor(60, 40, 27);
      doc.setFontSize(12);
    }
    if (pet.reason) {
      doc.setFont('helvetica', 'bold');
      doc.text('Reason for Adoption:', 14, y); y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(10);
      doc.text(doc.splitTextToSize(pet.reason, 180), 14, y); y += 12;
      doc.setTextColor(60, 40, 27);
      doc.setFontSize(12);
    }
    // Add message to take pet to shelter
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0);
    doc.text('Congratulations on your pet being adopted!', 14, y); y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 40, 27);
    doc.text('Please bring your pet to our shelter within 48 hours to complete the adoption process.', 14, y);
    doc.save(`${pet.petName || 'pet'}-adoption-report.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B3704D] mx-auto"></div>
          <p className="mt-4 text-[#80533b]">Loading your pet listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#80533b]">My Pet Listings</h1>
            <p className="text-gray-600 mt-2">Manage your pets listed for adoption</p>
          </div>
          <button
            onClick={handleAddNewPet}
            className="bg-[#B3704D] text-white px-6 py-3 rounded-xl hover:bg-[#D08860] transition-colors flex items-center gap-2"
          >
            <PlusCircle size={20} />
            Add New Pet
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <AlertCircle className="inline-block mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Pet Listings */}
        <div className="grid grid-cols-1 gap-6 h-1/2">
          {pets.map((pet) => {
            const statusInfo = getStatusMessage(pet._id);
            return (
              <div key={pet._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex min-h-[250px]">
                  {/* Pet Image with Species Icon */}
                  <div className="w-30/100 relative">
                    <img
                      src={pet.petImage ? `http://localhost:5000${pet.petImage}` : '/placeholder-pet.jpg'}
                      alt={pet.petName}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 rounded-lg p-2">
                      {getPetIcon(pet.petSpecies)}
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 p-6">
                    {/* Header with Name and Actions */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-semibold text-[#80533b] mb-1">{pet.petName}</h3>
                        <p className="text-gray-600">{pet.petBreed}</p>
                      </div>
                      <div className="flex gap-2">
                        {!isPetAdopted(pet._id) && (
                          <>
                            <button
                              onClick={() => handleEditClick(pet._id)}
                              className="p-2 text-[#B3704D] hover:bg-[#B3704D]/10 rounded-lg transition-colors"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(pet._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={20} />
                            </button>
                          </>
                        )}
                        {isPetAdopted(pet._id) && (
                          <button
                            onClick={() => handleDownloadReport(pet)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                          >
                            <CheckCircle size={20} className="inline-block mr-1" />
                            Download Report
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Two Column Layout for Details */}
                    <div className="grid grid-cols-2 gap-x-6">
                      {/* Pet Details Column */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-[#B3704D]" />
                          <div>
                            <span className="font-medium">Age:</span> {pet.petAge}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-[#B3704D]" />
                          <div>
                            <span className="font-medium">Gender:</span> {pet.petGender}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-[#B3704D]" />
                          <div>
                            <span className="font-medium">Status:</span>{' '}
                            {isPetAdopted(pet._id) ? (
                              <span className="text-blue-600 font-semibold">Adopted</span>
                            ) : isPetAdoptable(pet._id) ? (
                              <span className="text-green-600 font-semibold">Available</span>
                            ) : (
                              <span className="text-yellow-600 font-semibold">Pending Review</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Syringe className="w-5 h-5 text-[#B3704D]" />
                          <div>
                            <span className="font-medium">Vaccinated:</span> {pet.vaccinated ? 'Yes' : 'No'}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Scissors className="w-5 h-5 text-[#B3704D]" />
                          <div>
                            <span className="font-medium">Neutered:</span> {pet.neutered ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>

                      {/* Owner Contact Column */}
                      <div>
                        <h4 className="font-medium text-[#80533b] mb-4">Owner Contact</h4>
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-[#B3704D]" />
                            <p>{pet.email}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-[#B3704D]" />
                            <p>{pet.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Additional Pet Information */}
                    <div className="mt-6 border-t border-gray-100 pt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-[#80533b] mb-2">Pet Description</h4>
                          <p className="text-gray-600">
                            {pet.petDescription || 'No description available'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-[#80533b] mb-2">Reason for Adoption</h4>
                          <p className="text-gray-600">
                            {pet.reason || 'No reason specified'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Message - Moved to bottom */}
                    <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
                      statusInfo.type === 'success' ? 'bg-green-50 text-green-700' :
                      statusInfo.type === 'info' ? 'bg-blue-50 text-blue-700' :
                      'bg-yellow-50 text-yellow-700'
                    }`}>
                      <div className="mt-0.5">
                        {statusInfo.icon}
                      </div>
                      <p className="font-medium leading-relaxed">{statusInfo.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {pets.length === 0 && !error && (
          <div className="text-center py-12">
            <Heart className="mx-auto text-[#B3704D]" size={48} />
            <h3 className="text-xl font-semibold text-[#80533b] mt-4">No Pets Listed Yet</h3>
            <p className="text-gray-600 mt-2">Start by adding your first pet for adoption</p>
            <button
              onClick={handleAddNewPet}
              className="mt-4 bg-[#B3704D] text-white px-6 py-3 rounded-xl hover:bg-[#D08860] transition-colors"
            >
              Add Your First Pet
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-[#80533b] mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to remove this pet from the adoption listing? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, petId: null })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetOwnerDashboard; 