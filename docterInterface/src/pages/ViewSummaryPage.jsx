import { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const ViewSummaryPage = () => {
  const [selectedReport, setSelectedReport] = useState('type-distribution'); // Default to type-distribution
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success',
  });
  const navigate = useNavigate();
  const token = localStorage.getItem('profToken');

  const reportTypes = [
    { id: 'type-distribution', name: 'Appointment Type Distribution', chartType: 'pie' },
    { id: 'status-over-time', name: 'Appointment Status Over Time', chartType: 'bar' },
    { id: 'fee-distribution', name: 'Appointment Fee Distribution', chartType: 'pie' },
    { id: 'date-distribution', name: 'Appointment Date Distribution', chartType: 'bar' },
    { id: 'payment-status-distribution', name: 'Payment Status Distribution', chartType: 'pie' },
    { id: 'time-slot-distribution', name: 'Time Slot Distribution', chartType: 'pie' },
  ];

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  // Hide notification
  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'success' });
  };

  useEffect(() => {
    const validateToken = async () => {
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
        fetchReportData('type-distribution');
      } catch (error) {
        showNotification('Invalid token. Please log in again.', 'error');
        localStorage.removeItem('profToken');
        localStorage.removeItem('profRole');
        navigate('/professional/login');
      }
    };
    validateToken();
  }, [token, navigate]);

  const fetchReportData = async (reportId) => {
    setLoading(true);
    setChartData(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/appointments/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      console.log(`${reportId} data:`, data);

      if (!data || data.length === 0) {
        showNotification(`No data available for ${reportId.replace('-', ' ')}.`, 'error');
        return;
      }

      let chartConfig = null;
      switch (reportId) {
        case 'type-distribution':
          chartConfig = {
            labels: data.map((item) => item.appointmentType),
            datasets: [
              {
                label: 'Appointments by Type',
                data: data.map((item) => item.count),
                backgroundColor: ['#FFCA28', '#FFD54F', '#FFE082'],
                hoverBackgroundColor: ['#FFCA28', '#FFD54F', '#FFE082'],
              },
            ],
          };
          break;
        case 'status-over-time':
          const months = [...new Set(data.map((item) => `${item.year}-${item.month}`))].sort();
          chartConfig = {
            labels: months.map((m) => {
              const [year, month] = m.split('-');
              return new Date(year, month - 1).toLocaleString('default', { month: 'short', year: 'numeric' });
            }),
            datasets: ['scheduled', 'completed', 'cancelled'].map((status, index) => ({
              label: status.charAt(0).toUpperCase() + status.slice(1),
              data: months.map((month) => {
                const [year, monthNum] = month.split('-');
                const entry = data.find(
                  (d) => d.year === parseInt(year) && d.month === parseInt(monthNum) && d.status === status
                );
                return entry ? entry.count : 0;
              }),
              backgroundColor: ['#FFCA28', '#FFD54F', '#FFE082'][index],
              stack: 'Stack 0',
            })),
          };
          break;
        case 'fee-distribution':
          chartConfig = {
            labels: data.map((item) => item.feeRange),
            datasets: [
              {
                label: 'Appointments by Fee Range',
                data: data.map((item) => item.count),
                backgroundColor: ['#FFCA28', '#FFD54F', '#FFE082', '#FFF9C4', '#FFF59D'],
                hoverBackgroundColor: ['#FFCA28', '#FFD54F', '#FFE082', '#FFF9C4', '#FFF59D'],
              },
            ],
          };
          break;
        case 'date-distribution':
          chartConfig = {
            labels: data.map((item) =>
              new Date(item.year, item.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })
            ),
            datasets: [
              {
                label: 'Appointments by Month',
                data: data.map((item) => item.count),
                backgroundColor: '#FFD54F',
              },
            ],
          };
          break;
        case 'payment-status-distribution':
          chartConfig = {
            labels: data.map((item) => item.paymentStatus),
            datasets: [
              {
                label: 'Appointments by Payment Status',
                data: data.map((item) => item.count),
                backgroundColor: ['#FFCA28', '#FFD54F', '#FFE082'],
                hoverBackgroundColor: ['#FFCA28', '#FFD54F', '#FFE082'],
              },
            ],
          };
          break;
        case 'time-slot-distribution':
          chartConfig = {
            labels: data.map((item) => item.timeSlot),
            datasets: [
              {
                label: 'Appointments by Time Slot',
                data: data.map((item) => item.count),
                backgroundColor: ['#FFCA28', '#FFD54F', '#FFE082'],
                hoverBackgroundColor: ['#FFCA28', '#FFD54F', '#FFE082'],
              },
            ],
          };
          break;
        default:
          throw new Error('Unknown report type');
      }
      setChartData(chartConfig);
    } catch (error) {
      console.error(`Error fetching ${reportId}:`, error);
      let errorMessage = 'Failed to load data';
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

  const handleReportSelect = (reportId) => {
    setSelectedReport(reportId);
    fetchReportData(reportId);
  };

  // Mock stats data (static for UI purposes)
  const stats = [
    { title: 'Total Appointments', value: '', icon: '📅' },
    { title: 'Completed', value: '', icon: '✅' },
    { title: 'Cancelled', value: '', icon: '❌' },
    { title: 'Queries', value: '', icon: '💬' },
  ];

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
        {/* Header */}
        <h1 className="text-4xl font-bold mb-10 text-amber-950 tracking-tight animate-slide-in">
          Appointment Summary Reports
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-in">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white p-6 rounded-2xl shadow-xl text-center hover:shadow-2xl transform hover:scale-105 transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-3xl mb-3 text-amber-500 transform hover:rotate-12 transition-transform duration-300">{stat.icon}</div>
              <h3 className="text-lg font-semibold text-amber-950 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-amber-700">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Report Type Buttons */}
        <div className="mb-12 max-w-4xl mx-auto flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="w-full text-xl font-semibold mb-4 text-amber-700 text-center">Select a Report</h2>
          {reportTypes.map((report, index) => (
            <button
              key={report.id}
              className={`px-6 py-3 rounded-xl shadow-md transition-all duration-300 ${
                selectedReport === report.id
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-white text-amber-950 hover:bg-amber-100 hover:shadow-lg'
              }`}
              onClick={() => handleReportSelect(report.id)}
              style={{ animationDelay: `${index * 0.1 + 0.4}s` }}
            >
              {report.name}
            </button>
          ))}
        </div>

        {/* Chart or Loading/No Data State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {!loading && !chartData && selectedReport && (
          <div className="text-center py-12 animate-slide-in" style={{ animationDelay: '0.6s' }}>
            <svg
              className="w-16 h-16 mx-auto text-amber-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-3-3v6m-9 3h18a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-amber-700 text-lg">No data available for this report.</p>
          </div>
        )}
        {!loading && chartData && (
          <div
            className="bg-white p-10 rounded-2xl shadow-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white animate-slide-up"
            style={{ animationDelay: '0.6s' }}
          >
            {reportTypes.find((r) => r.id === selectedReport)?.chartType === 'pie' ? (
              <Pie
                data={chartData}
                options={{
                  plugins: {
                    legend: { position: 'top', labels: { color: '#92400E' } },
                    tooltip: { enabled: true },
                    title: {
                      display: true,
                      text: reportTypes.find((r) => r.id === selectedReport)?.name,
                      font: { size: 20 },
                      color: '#92400E',
                    },
                  },
                  maintainAspectRatio: false,
                }}
                height={400}
              />
            ) : (
              <Bar
                data={chartData}
                options={{
                  plugins: {
                    legend: selectedReport === 'status-over-time' ? { position: 'top', labels: { color: '#92400E' } } : { display: false },
                    tooltip: { enabled: true },
                    title: {
                      display: true,
                      text: reportTypes.find((r) => r.id === selectedReport)?.name,
                      font: { size: 20 },
                      color: '#92400E',
                    },
                  },
                  scales: {
                    x: {
                      title: { display: true, text: selectedReport === 'status-over-time' ? 'Month' : 'Category', color: '#92400E' },
                      ticks: { color: '#92400E' },
                    },
                    y: {
                      title: { display: true, text: 'Number of Appointments', color: '#92400E' },
                      ticks: { color: '#92400E' },
                      beginAtZero: true,
                    },
                  },
                  maintainAspectRatio: false,
                }}
                height={400}
              />
            )}
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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

        .animate-slide-in-from-right {
          animation: slideInFromRight 0.3s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ViewSummaryPage;