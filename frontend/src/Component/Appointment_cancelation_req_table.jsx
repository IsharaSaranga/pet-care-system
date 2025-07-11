import React, { useState, useEffect } from 'react';

const AppointmentCancelationReqTable = () => {
  const [refundRequests, setRefundRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRefundRequests = async () => {
      try {
        console.log('Fetching refund requests from http://localhost:5000/api/appointments/refundrequestforreview');
        const response = await fetch('http://localhost:5000/api/appointments/refundrequestforreview');
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Response details:', {
            status: response.status,
            statusText: response.statusText,
            body: errorData,
          });
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        setRefundRequests(data);
        setFilteredRequests(data.filter((request) => request.status === 'pending')); // Initialize filtered list
        setError(null);
      } catch (error) {
        console.error('Error fetching refund requests:', error);
        setError(error.message || 'Failed to fetch refund requests');
      }
    };
    fetchRefundRequests();
  }, []);

  // Handle search input and filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRequests(refundRequests.filter((request) => request.status === 'pending'));
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = refundRequests
      .filter((request) => request.status === 'pending')
      .filter((request) =>
        (request.userId?.name || '').toLowerCase().includes(lowerSearchTerm)
      )
      .sort((a, b) => {
        const aName = (a.userId?.name || '').toLowerCase();
        const bName = (b.userId?.name || '').toLowerCase();

        // Exact match
        if (aName === lowerSearchTerm && bName !== lowerSearchTerm) return -1;
        if (bName === lowerSearchTerm && aName !== lowerSearchTerm) return 1;

        // Starts with
        if (aName.startsWith(lowerSearchTerm) && !bName.startsWith(lowerSearchTerm)) return -1;
        if (bName.startsWith(lowerSearchTerm) && !aName.startsWith(lowerSearchTerm)) return 1;

        // Contains (default sort by name)
        return aName.localeCompare(bName);
      });

    setFilteredRequests(filtered);
  }, [searchTerm, refundRequests]);

  const handleRefundAction = async (id, status) => {
    try {
      console.log(`Processing refund ${id} with status ${status}`);
      const response = await fetch(`http://localhost:5000/api/appointments/refundrequests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Processing error details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const updatedRequest = await response.json();
      setRefundRequests((prev) =>
        prev.map((req) => (req._id === id ? updatedRequest.data : req))
      );
      setError(null);
    } catch (error) {
      console.error(`Error processing refund ${status}:`, error);
      setError(`Failed to ${status} refund: ${error.message}`);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] p-8 min-h-screen">
      <div className="flex justify-between items-center mb-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-3xl font-bold text-amber-950 tracking-tight">Pending Refund Requests</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex items-center gap-4 max-w-lg mx-auto animate-slide-in" style={{ animationDelay: '0.2s' }}>
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by user name..."
            className="w-full p-4 pl-12 border border-amber-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white transition-all duration-300 hover:shadow-lg placeholder-amber-400 text-amber-950"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="bg-amber-600 text-white px-5 py-3 rounded-xl hover:bg-amber-700 transition-all duration-300 shadow-sm hover:shadow-md font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <p className="text-amber-600 font-medium text-center mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Error: {error}
        </p>
      )}
      {filteredRequests.length === 0 && !error && (
        <p className="text-amber-600 font-medium text-center mb-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          No pending refund requests found.
        </p>
      )}
      {filteredRequests.length > 0 && (
        <div className="overflow-x-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <table className="min-w-full bg-white border border-amber-200 rounded-xl shadow-lg">
            <thead>
              <tr className="bg-amber-800 text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide w-32">User Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide w-24">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide w-24">Processing Fee</th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide w-24">Net Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide w-20">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide w-40">Reason</th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide w-28">Payment Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide w-32">Request Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold tracking-wide w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr
                  key={request._id}
                  className={`border-b border-amber-100 hover:bg-amber-50 transition-colors duration-200 ${
                    index === 0 && searchTerm ? 'bg-amber-100' : ''
                  }`}
                >
                  <td className="px-6 py-4 text-amber-950 font-medium w-32">{request.userId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-amber-950 w-24">${(request.amount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-amber-950 w-24">${(request.processingFee || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-amber-950 w-24">${(request.netAmount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-amber-950 w-20">{request.status}</td>
                  <td className="px-6 py-4 text-amber-950 w-40 overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">
                    {request.reason || 'No reason provided'}
                  </td>
                  <td className="px-6 py-4 text-amber-950 w-28">{request.paymentMethod || 'N/A'}</td>
                  <td className="px-6 py-4 text-amber-950 w-32">
                    {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 flex space-x-2 w-32">
                    <button
                      className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 relative group"
                      onClick={() => handleRefundAction(request._id, 'approved')}
                      disabled={request.status !== 'pending'}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-1 text-sm text-white bg-amber-950 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Approve Refund
                      </span>
                    </button>
                    <button
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 relative group"
                      onClick={() => handleRefundAction(request._id, 'rejected')}
                      disabled={request.status !== 'pending'}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-3 py-1 text-sm text-white bg-amber-950 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Deny Refund
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AppointmentCancelationReqTable;