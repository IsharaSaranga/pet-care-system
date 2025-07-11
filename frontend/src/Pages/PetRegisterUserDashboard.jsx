import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2,
  AlertCircle,
  Search,
  Dog,
  CalendarCheck
} from 'lucide-react';
import jsPDF from 'jspdf';

const PetRegisterUserDashboard = () => {
  const [adoptionForms, setAdoptionForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState({ show: false, formId: null });
  const [homeVisits, setHomeVisits] = useState([]);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visitResponse, setVisitResponse] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const navigate = useNavigate();

  // Get token and user data from localStorage
  const token = localStorage.getItem('petOwnerToken');
  const userData = JSON.parse(localStorage.getItem('petOwnerUser') || '{}');
  const userEmail = userData.email;

  // Fetch adoption forms for the user
  const fetchAdoptionForms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/adoptionform/my-applications', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAdoptionForms(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching adoption forms:", err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
      setError("Failed to load your adoption forms");
    } finally {
      setLoading(false);
    }
  };

  // Fetch home visits for the user
  const fetchHomeVisits = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/homevisits/my-visits', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHomeVisits(response.data);
    } catch (err) {
      console.error("Error fetching home visits:", err);
    }
  };

  // Handle home visit response
  const handleVisitResponse = async (visitId, response) => {
    try {
      const visit = homeVisits.find(v => v._id === visitId);
      setSelectedVisit(visit);
      setVisitResponse(response);
      setVisitNotes('');
    } catch (err) {
      console.error("Error preparing visit response:", err);
    }
  };

  // Add the submitVisitResponse function
  const submitVisitResponse = async () => {
    try {
      if (!selectedVisit) {
        console.error("No visit selected");
        return;
      }

      await axios.put(
        `http://localhost:5000/api/homevisits/${selectedVisit._id}`,
        { 
          userResponse: visitResponse,
          userNotes: visitNotes,
          status: visitResponse === 'accepted' ? 'approved' : 'rejected'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Refresh the visits list
      await fetchHomeVisits();
      
      // Reset states
      setSelectedVisit(null);
      setVisitNotes('');
      setVisitResponse('');

      // Show success notification
      setNotification({
        show: true,
        message: `Home visit ${visitResponse === 'accepted' ? 'accepted' : 'rejected'} successfully`,
        type: 'success'
      });
    } catch (err) {
      console.error("Error responding to home visit:", err);
      setNotification({
        show: true,
        message: "Failed to respond to home visit",
        type: 'error'
      });
    }
  };

  useEffect(() => {
    if (!token || !userEmail) {
      navigate('/login');
      return;
    }
    fetchAdoptionForms();
    fetchHomeVisits();
  }, [token, userEmail, navigate]);

  // Handle form deletion
  const handleDeleteForm = async (formId) => {
    try {
      await axios.delete(`http://localhost:5000/api/adoptionform/delete/${formId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchAdoptionForms();
      setShowDeleteConfirm({ show: false, formId: null });
    } catch (err) {
      console.error("Error deleting form:", err);
      setError("Failed to delete the adoption form");
    }
  };

  // Filter adoption forms based on search query
  const filteredForms = adoptionForms.filter(form => 
    form.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.status?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to download adoption report as PDF
  const handleDownloadReport = (form) => {
    const doc = new jsPDF();
    // Header with color
    doc.setFillColor(208, 136, 96); // #D08860
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('Adoption Application Report', 105, 20, { align: 'center' });
    doc.setTextColor(60, 40, 27); // #3C281B
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Pet Name:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${form.petName || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Pet Type:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${form.petType || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Home Type:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${form.homeType || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Employment:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${form.employmentStatus || ''}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Has Yard:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${form.hasYard ? 'Yes' : 'No'}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Other Pets:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${form.hasOtherPets ? 'Yes' : 'No'}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Submitted:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`${new Date(form.createdAt).toLocaleDateString()}`, 50, y); doc.setFont('helvetica', 'normal'); y += 10;
    doc.text(`Status:`, 14, y); doc.setFont('helvetica', 'bold'); doc.text(`Approved`, 50, y); doc.setFont('helvetica', 'normal'); y += 15;
    doc.setTextColor(34, 197, 94); // green
    doc.setFontSize(14);
    doc.text('Congratulations! Your adoption application is approved.', 14, y); y += 10;
    doc.setTextColor(60, 40, 27);
    doc.setFontSize(12);
    doc.text('Please visit our shelter to complete the adoption process and take your new pet home.', 14, y);
    doc.save(`Adoption_Report_${form.petName || 'Pet'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] pt-24 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#80533b]">My Adoption Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your adoption requests and communications</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <AlertCircle className="inline-block mr-2" size={20} />
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by pet name or status..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Adoption Forms Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-[#80533b] mb-4 flex items-center">
            <FileText className="mr-2" size={24} />
            My Adoption Forms
          </h2>
          
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : filteredForms.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No adoption forms found</div>
          ) : (
            <div className="grid gap-6">
              {filteredForms.map((form) => {
                // Find related home visits for this form
                const relatedVisits = homeVisits.filter(visit => visit.adoptionFormId === form._id);
                
                return (
                  <div key={form._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Left Section - Pet Image and Basic Info */}
                      <div className="flex-shrink-0">
                        <div className="relative w-40 h-40 rounded-xl overflow-hidden shadow-md">
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
                          <h3 className="text-xl font-bold text-[#80533b]">{form.petName}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium mt-2 inline-block ${
                            form.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            form.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                            form.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {form.status ? form.status.charAt(0).toUpperCase() + form.status.slice(1) : 'Pending'}
                          </span>
                        </div>
                      </div>

                      {/* Right Section - Form Details */}
                      <div className="flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-[#D08860] rounded-full mr-2"></span>
                              <p className="text-gray-700">
                                <span className="font-semibold">Pet Type:</span> {form.petType}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-[#D08860] rounded-full mr-2"></span>
                              <p className="text-gray-700">
                                <span className="font-semibold">Home Type:</span> {form.homeType}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-[#D08860] rounded-full mr-2"></span>
                              <p className="text-gray-700">
                                <span className="font-semibold">Employment:</span> {form.employmentStatus}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-[#D08860] rounded-full mr-2"></span>
                              <p className="text-gray-700">
                                <span className="font-semibold">Has Yard:</span> 
                                <span className={`ml-2 ${form.hasYard ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {form.hasYard ? 'Yes' : 'No'}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-[#D08860] rounded-full mr-2"></span>
                              <p className="text-gray-700">
                                <span className="font-semibold">Other Pets:</span>
                                <span className={`ml-2 ${form.hasOtherPets ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {form.hasOtherPets ? 'Yes' : 'No'}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-[#D08860] rounded-full mr-2"></span>
                              <p className="text-gray-700">
                                <span className="font-semibold">Submitted:</span> {new Date(form.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {form.additionalInfo && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-gray-700">
                              <span className="font-semibold">Additional Info:</span>
                              <span className="ml-2">{form.additionalInfo}</span>
                            </p>
                          </div>
                        )}

                        {/* Home Visit Requests Section */}
                        {relatedVisits.length > 0 && (
                          <div className="mt-6 border-t border-gray-100 pt-4">
                            <h4 className="text-lg font-semibold text-[#80533b] mb-3 flex items-center">
                              <CalendarCheck className="mr-2" size={20} />
                              Home Visit Requests
                            </h4>
                            <div className="space-y-3">
                              {relatedVisits.map((visit) => (
                                <div key={visit._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div>
                                      <p className="text-gray-700">
                                        <span className="font-semibold">Date:</span> {new Date(visit.date).toLocaleDateString()}
                                      </p>
                                      <p className="text-gray-700">
                                        <span className="font-semibold">Time:</span> {new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                      {visit.notes && (
                                        <p className="text-gray-600 mt-1">
                                          <span className="font-semibold">Notes:</span> {visit.notes}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <div className="flex flex-col items-end space-y-2">
                                      {visit.userResponse === 'pending' ? (
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => handleVisitResponse(visit._id, 'accepted')}
                                            className="px-3 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition flex items-center space-x-1"
                                          >
                                            <CheckCircle size={16} />
                                            <span>Accept</span>
                                          </button>
                                          <button
                                            onClick={() => handleVisitResponse(visit._id, 'rejected')}
                                            className="px-3 py-1 bg-rose-500 text-white rounded hover:bg-rose-600 transition flex items-center space-x-1"
                                          >
                                            <XCircle size={16} />
                                            <span>Reject</span>
                                          </button>
                                        </div>
                                      ) : (
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                          visit.userResponse === 'accepted' 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : 'bg-rose-100 text-rose-800'
                                        }`}>
                                          {visit.userResponse === 'accepted' ? 'Visit Accepted' : 'Visit Rejected'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {/* Show user's response and notes if responded */}
                                  {visit.userResponse !== 'pending' && (
                                    <div className="mt-2 text-sm text-gray-700">
                                      <span className="font-semibold">Your Response:</span>
                                      {visit.userNotes && (
                                        <span className="ml-2 italic">{visit.userNotes}</span>
                                      )}
                                    </div>
                                  )}
                                  {selectedVisit?._id === visit._id && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      <textarea
                                        value={visitNotes}
                                        onChange={(e) => setVisitNotes(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                                        rows="2"
                                        placeholder="Add any notes or comments about the visit..."
                                      />
                                      <div className="flex justify-end space-x-2">
                                        <button
                                          onClick={() => {
                                            setSelectedVisit(null);
                                            setVisitNotes('');
                                            setVisitResponse('');
                                          }}
                                          className="px-3 py-1 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          onClick={submitVisitResponse}
                                          className={`px-3 py-1 text-white rounded ${
                                            visitResponse === 'accepted' 
                                              ? 'bg-emerald-500 hover:bg-emerald-600' 
                                              : 'bg-rose-500 hover:bg-rose-600'
                                          }`}
                                        >
                                          Submit Response
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Only show edit and delete buttons if the form is not approved or rejected */}
                        {form.status !== 'approved' && form.status !== 'rejected' && (
                          <div className="mt-4 flex justify-end space-x-3">
                            <button
                              onClick={() => navigate(`/edit-adoption-form/${form._id}`)}
                              className="px-4 py-2 bg-[#D08860] text-white rounded-lg hover:bg-[#80533b] transition-colors flex items-center space-x-2"
                            >
                              <Edit size={18} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm({ show: true, formId: form._id })}
                              className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center space-x-2"
                            >
                              <Trash2 size={18} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}

                        {/* Show approval message for approved forms */}
                        {form.status === 'approved' && (
                          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="text-emerald-500" size={24} />
                              <div>
                                <h4 className="text-emerald-800 font-semibold">Congratulations! Your request has been approved</h4>
                                <p className="text-emerald-700 mt-1">
                                  Please visit our shelter to complete the adoption process and take your new pet home.
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownloadReport(form)}
                              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                            >
                              <FileText size={18} />
                              <span>Download Report</span>
                            </button>
                          </div>
                        )}

                        {/* Show rejection message for rejected forms */}
                        {form.status === 'rejected' && (
                          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <XCircle className="text-rose-500" size={24} />
                              <div>
                                <h4 className="text-rose-800 font-semibold">Application Status: Rejected</h4>
                                <p className="text-rose-700 mt-1">
                                  We regret to inform you that your adoption request has not been approved at this time. 
                                  You may submit a new application for a different pet in the future.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm.show && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this adoption form? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm({ show: false, formId: null })}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteForm(showDeleteConfirm.formId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

export default PetRegisterUserDashboard; 