import React, { useState, useEffect } from 'react';

const AppointmentCancelationReqTable = () => {
  const [refundRequests, setRefundRequests] = useState([]);
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
        setError(null);
      } catch (error) {
        console.error('Error fetching refund requests:', error);
        setError(error.message || 'Failed to fetch refund requests');
      }
    };
    fetchRefundRequests();
  }, []);

  const handleRefundAction = async (id, status) => {
    try {
      console.log(`Processing refund ${id} with status ${status}`);
      const response = await fetch(`http://localhost:5000/api/appointments/refundrequests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add Authorization header if auth is implemented, e.g.:
          // 'Authorization': `Bearer ${yourToken}`
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

  // Filter refund requests to only show those with status "pending"
  const pendingRequests = refundRequests.filter((request) => request.status === 'pending');

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Pending Refund Requests</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {pendingRequests.length === 0 && !error && (
        <p className="text-gray-500 mb-4">No pending refund requests found.</p>
      )}
      {pendingRequests.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">User Name</th>
                <th className="py-2 px-4 border-b">Amount</th>
                <th className="py-2 px-4 border-b">Processing Fee</th>
                <th className="py-2 px-4 border-b">Net Amount</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Reason</th>
                <th className="py-2 px-4 border-b">Payment Method</th>
                <th className="py-2 px-4 border-b">Request Date</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{request.userId?.name || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">${(request.amount || 0).toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">${(request.processingFee || 0).toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">${(request.netAmount || 0).toFixed(2)}</td>
                  <td className="py-2 px-4 border-b">{request.status}</td>
                  <td className="py-2 px-4 border-b">{request.reason || 'No reason provided'}</td>
                  <td className="py-2 px-4 border-b">{request.paymentMethod || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">
                    {request.requestDate ? new Date(request.requestDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600 disabled:opacity-50"
                      onClick={() => handleRefundAction(request._id, 'approved')}
                      disabled={request.status !== 'pending'}
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
                      onClick={() => handleRefundAction(request._id, 'rejected')}
                      disabled={request.status !== 'pending'}
                    >
                      Deny
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppointmentCancelationReqTable;