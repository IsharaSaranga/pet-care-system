import React, { useState } from 'react';

const AdoptionScheduler = () => {
  const [formData, setFormData] = useState({
    petName: '',
    applicantName: '',
    applicantAddress: '',
    applicantPhone: '',
    visitDate: '',
    visitTime: '',
    coordinator: '',
    notes: ''
  });
  
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      petName: "Max",
      applicantName: "John Smith",
      applicantAddress: "123 Oak Lane, Springfield",
      visitDate: "2025-04-05",
      visitTime: "14:00",
      coordinator: "Emily Johnson",
      status: "Scheduled"
    },
    {
      id: 2,
      petName: "Bella",
      applicantName: "Maria Garcia",
      applicantAddress: "456 Pine Street, Riverdale",
      visitDate: "2025-04-04",
      visitTime: "10:30",
      coordinator: "David Chen",
      status: "Completed"
    }
  ]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const newSchedule = {
      id: schedules.length + 1,
      ...formData,
      status: "Scheduled"
    };
    setSchedules([...schedules, newSchedule]);
    setFormData({
      petName: '',
      applicantName: '',
      applicantAddress: '',
      applicantPhone: '',
      visitDate: '',
      visitTime: '',
      coordinator: '',
      notes: ''
    });
  };
  
  const coordinators = ["Emily Johnson", "David Chen", "Sarah Williams", "Michael Brown"];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] p-6">
      <div className="max-w-6xl mx-auto">
        <header className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Adoption Home Visit Scheduler</h1>
          <p className="text-gray-600">Create and manage home visit schedules for potential pet adopters</p>
        </header>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Form Section */}
          <div className="bg-white shadow-md rounded-lg p-6 md:w-1/2">
            <h2 className="text-2xl font-semibold mb-4">Schedule New Home Visit</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Pet Name</label>
                  <input 
                    type="text" 
                    name="petName" 
                    value={formData.petName} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded p-2" 
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Applicant Name</label>
                  <input 
                    type="text" 
                    name="applicantName" 
                    value={formData.applicantName} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded p-2" 
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">Address</label>
                  <input 
                    type="text" 
                    name="applicantAddress" 
                    value={formData.applicantAddress} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded p-2" 
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Phone</label>
                  <input 
                    type="tel" 
                    name="applicantPhone" 
                    value={formData.applicantPhone} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded p-2" 
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Coordinator</label>
                  <select 
                    name="coordinator" 
                    value={formData.coordinator} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded p-2" 
                    required
                  >
                    <option value="">Select Coordinator</option>
                    {coordinators.map(coord => (
                      <option key={coord} value={coord}>{coord}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Visit Date</label>
                  <input 
                    type="date" 
                    name="visitDate" 
                    value={formData.visitDate} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded p-2" 
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-1">Visit Time</label>
                  <input 
                    type="time" 
                    name="visitTime" 
                    value={formData.visitTime} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded p-2" 
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-1">Notes</label>
                  <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded p-2 h-24" 
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  type="submit" 
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
          
          {/* Schedule List Section */}
          <div className="bg-white shadow-md rounded-lg p-6 md:w-1/2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Upcoming Home Visits</h2>
              <select className="border border-gray-300 rounded p-1">
                <option>All Visits</option>
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>
            
            <div className="overflow-y-auto max-h-96">
              {schedules.map(schedule => (
                <div 
                  key={schedule.id} 
                  className="border-l-4 border-blue-500 bg-gray-50 p-4 mb-4 rounded shadow-sm hover:shadow-md transition duration-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{schedule.petName} - {schedule.applicantName}</h3>
                      <p className="text-gray-600 text-sm">{schedule.applicantAddress}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      schedule.status === "Completed" ? "bg-green-100 text-green-800" : 
                      schedule.status === "Cancelled" ? "bg-red-100 text-red-800" : 
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {schedule.status}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex items-center text-sm">
                    <svg className="h-4 w-4 text-gray-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(schedule.visitDate).toLocaleDateString()} at {schedule.visitTime}</span>
                    <span className="mx-2">•</span>
                    <span>Coordinator: {schedule.coordinator}</span>
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    <button className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                    <button className="text-sm text-green-600 hover:text-green-800">Complete</button>
                    <button className="text-sm text-red-600 hover:text-red-800">Cancel</button>
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



export default AdoptionScheduler;