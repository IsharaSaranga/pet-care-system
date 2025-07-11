import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Custom Notification Component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm animate-slide-in-from-right ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-amber-200 transition-colors duration-200"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const GenerateReportPage = () => {
  const [incomeData, setIncomeData] = useState([]);
  const [petsUsersData, setPetsUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('profToken');

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  // Hide notification
  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    const validateTokenAndFetchData = async () => {
      if (!token) {
        showNotification('No authentication token found. Please log in.', 'error');
        navigate('/professional/login');
        return;
      }
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          showNotification('Session expired. Please log in again.', 'error');
          localStorage.removeItem('profToken');
          localStorage.removeItem('profRole');
          navigate('/professional/login');
          return;
        }
        if (!['vet', 'groomer', 'pet-trainer'].includes(decoded.role)) {
          showNotification('Unauthorized role.', 'error');
          navigate('/professional/dashboard');
          return;
        }
        setLoading(true);

        const [incomeResponse, petsUsersResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/appointments/income-report', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/appointments/pets-users-report', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log('Income report data:', incomeResponse.data);
        console.log('Pets-users report data:', petsUsersResponse.data);

        setIncomeData(incomeResponse.data);
        setPetsUsersData(petsUsersResponse.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
        let errorMessage = 'Failed to load reports';
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'Session expired. Please log in again.';
            localStorage.removeItem('profToken');
            localStorage.removeItem('profRole');
            navigate('/professional/login');
          } else {
            errorMessage = error.response.data.message || `Server error (Status: ${error.response.status})`;
          }
        } else {
          errorMessage = `Network error: ${error.message}`;
        }
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };
    validateTokenAndFetchData();
  }, [token, navigate]);

  const downloadPDF = (reportType) => {
    try {
      console.log('Generating PDF for:', reportType);
      console.log('Income data:', incomeData);
      console.log('Pets-users data:', petsUsersData);

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(
        reportType === 'income' ? 'Monthly Appointment Income Report' : 'Pets and Users Report',
        14,
        20
      );

      if (reportType === 'income') {
        if (!incomeData || !Array.isArray(incomeData)) {
          throw new Error('Invalid incomeData');
        }
        autoTable(doc, {
          startY: 30,
          head: [['Month', 'Total Income ($)', 'Number of Appointments']],
          body: incomeData.map((item) => {
            if (!item.year || !item.month || item.totalIncome == null || item.appointmentCount == null) {
              console.warn('Invalid income item:', item);
              return ['N/A', '0.00', '0'];
            }
            return [
              new Date(item.year, item.month - 1).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              }),
              item.totalIncome.toFixed(2),
              item.appointmentCount,
            ];
          }),
          theme: 'striped',
        });
      } else {
        if (!petsUsersData || !Array.isArray(petsUsersData)) {
          throw new Error('Invalid petsUsersData');
        }
        autoTable(doc, {
          startY: 30,
          head: [['Pet Name', 'Pet Breed', 'Owner Name', 'Owner Email', 'Owner Phone']],
          body: petsUsersData.map((item) => {
            if (!item.petName || !item.petType || !item.ownerName) {
              console.warn('Invalid pet item:', item);
              return ['N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
            }
            return [
              item.petName,
              item.petType,
              item.ownerName,
              item.ownerEmail,
              item.ownerPhone,
            ];
          }),
          theme: 'striped',
        });
      }

      console.log('Saving PDF:', `${reportType}-report.pdf`);
      doc.save(`${reportType}-report.pdf`);
      showNotification(`PDF for ${reportType} report generated successfully!`, 'success');
    } catch (error) {
      console.error('Error generating PDF:', {
        message: error.message,
        stack: error.stack,
        reportType,
      });
      showNotification('Failed to generate PDF: ' + error.message, 'error');
    }
  };

  const downloadExcel = (reportType) => {
    let data, headers, fileName;
    if (reportType === 'income') {
      headers = ['Month', 'Total Income ($)', 'Number of Appointments'];
      data = incomeData.map((item) => ({
        Month: new Date(item.year, item.month - 1).toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        }),
        'Total Income ($)': item.totalIncome.toFixed(2),
        'Number of Appointments': item.appointmentCount,
      }));
      fileName = 'income-report.xlsx';
    } else {
      headers = ['Pet Name', 'Pet Breed', 'Owner Name', 'Owner Email', 'Owner Phone'];
      data = petsUsersData.map((item) => ({
        'Pet Name': item.petName,
        'Pet Breed': item.petType,
        'Owner Name': item.ownerName,
        'Owner Email': item.ownerEmail,
        'Owner Phone': item.ownerPhone,
      }));
      fileName = 'pets-users-report.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(data, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, fileName);
    showNotification(`Excel for ${reportType} report generated successfully!`, 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] p-8 animate-fade-in">
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-amber-950 tracking-tight">
          Generate Reports
        </h1>
        {loading && (
          <p className="text-amber-700 text-lg animate-pulse">
            Loading report data...
          </p>
        )}
        {!loading && (
          <div className="space-y-8">
            {/* Monthly Appointment Income Report */}
            <div
              className="bg-white shadow-xl rounded-xl p-8 animate-slide-in"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-amber-700">
                  Monthly Appointment Income
                </h2>
                <div className="space-x-3">
                  <button
                    onClick={() => downloadPDF('income')}
                    className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => downloadExcel('income')}
                    className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Download Excel
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-amber-200 rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-amber-100 text-amber-950">
                      <th className="py-3 px-6 text-left font-semibold">Month</th>
                      <th className="py-3 px-6 text-left font-semibold">Total Income ($)</th>
                      <th className="py-3 px-6 text-left font-semibold">Number of Appointments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomeData.length > 0 ? (
                      incomeData.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-amber-100 hover:bg-amber-50 transition-colors duration-200"
                        >
                          <td className="py-3 px-6 text-amber-950">
                            {new Date(item.year, item.month - 1).toLocaleString('default', {
                              month: 'long',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-6 text-amber-950">{item.totalIncome.toFixed(2)}</td>
                          <td className="py-3 px-6 text-amber-950">{item.appointmentCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-4 px-6 text-amber-700 text-center">
                          No income data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pets and Users Report */}
            <div
              className="bg-white shadow-xl rounded-xl p-8 animate-slide-in"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-amber-700">
                  Pets and Their Users
                </h2>
                <div className="space-x-3">
                  <button
                    onClick={() => downloadPDF('pets-users')}
                    className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={() => downloadExcel('pets-users')}
                    className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-600 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    Download Excel
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-amber-200 rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-amber-100 text-amber-950">
                      <th className="py-3 px-6 text-left font-semibold">Pet Name</th>
                      <th className="py-3 px-6 text-left font-semibold">Pet Breed</th>
                      <th className="py-3 px-6 text-left font-semibold">Owner Name</th>
                      <th className="py-3 px-6 text-left font-semibold">Owner Email</th>
                      <th className="py-3 px-6 text-left font-semibold">Owner Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {petsUsersData.length > 0 ? (
                      petsUsersData.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-amber-100 hover:bg-amber-50 transition-colors duration-200"
                        >
                          <td className="py-3 px-6 text-amber-950">{item.petName}</td>
                          <td className="py-3 px-6 text-amber-950">{item.petType}</td>
                          <td className="py-3 px-6 text-amber-950">{item.ownerName}</td>
                          <td className="py-3 px-6 text-amber-950">{item.ownerEmail}</td>
                          <td className="py-3 px-6 text-amber-950">{item.ownerPhone}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 px-6 text-amber-700 text-center">
                          No pets or user data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

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

        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }

        .animate-slide-in-from-right {
          animation: slideInFromRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default GenerateReportPage;