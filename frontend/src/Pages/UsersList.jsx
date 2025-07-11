import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Heart, X, Trash2, Search, Shield, UserPlus, Users, UserCog, LogOut, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import defaultProfilePic from '../assets/profilepic.png';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Stores user ID for deletion
  const [dailyRegistrations, setDailyRegistrations] = useState([]);
  const navigate = useNavigate();

  // Get admin name from localStorage or set default
  const admin = JSON.parse(localStorage.getItem('admin')) || { name: 'Admin' };
  const adminName = admin.name || 'Admin';

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/StaffLogin');
  };

  // Fetch all users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const response = await axios.get('http://localhost:5000/api/users/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched users:', response.data); // Log to inspect data
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.response?.data?.message || 'Error fetching users');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle search filtering
  useEffect(() => {
    const filtered = users.filter((user) => {
      // Safely handle undefined or non-string name/email
      const name = typeof user.name === 'string' ? user.name.toLowerCase() : '';
      const email = typeof user.email === 'string' ? user.email.toLowerCase() : '';
      const query = searchQuery.toLowerCase();
      return name.includes(query) || email.includes(query);
    });
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Calculate daily registrations
  useEffect(() => {
    if (users.length > 0) {
      const registrationsByDay = users.reduce((acc, user) => {
        const date = new Date(user.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const sortedDates = Object.keys(registrationsByDay).sort((a, b) => new Date(a) - new Date(b));
      const last7Days = sortedDates.slice(-7); // Get last 7 days

      setDailyRegistrations(last7Days.map(date => ({
        date,
        count: registrationsByDay[date]
      })));
    }
  }, [users]);

  // Chart data
  const chartData = {
    labels: dailyRegistrations.map(item => item.date),
    datasets: [
      {
        label: 'Daily User Registrations',
        data: dailyRegistrations.map(item => item.count),
        borderColor: '#D88C6D',
        backgroundColor: 'rgba(216, 140, 109, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily User Registration Trends',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Handle delete profile
  const handleDeleteProfile = async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/users/deleteProfile/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.message === 'Profile deleted successfully') {
        // Update both users and filteredUsers state
        setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
        setFilteredUsers(prevFiltered => prevFiltered.filter(user => user._id !== userId));
        setDeleteConfirm(null);
        setError(''); // Clear any existing errors
      } else {
        setError('Failed to delete profile: Unexpected response from server');
      }
    } catch (err) {
      console.error('Delete error:', err);
      if (err.response) {
        if (err.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (err.response.status === 404) {
          setError('User not found.');
        } else {
          setError(err.response.data?.message || 'Error deleting profile');
        }
      } else if (err.request) {
        setError('No response from server. Please try again later.');
      } else {
        setError('Error deleting profile. Please try again.');
      }
    }
  };

  // Add export function
  const handleExportReport = () => {

    const wb = XLSX.utils.book_new();

    const exportData = dailyRegistrations.map(item => ({
      Date: item.date,
      'Number of Registrations': item.count
    }));

    const totalRegistrations = exportData.reduce((sum, row) => sum + row['Number of Registrations'], 0);
    exportData.push({
      Date: 'Total',
      'Number of Registrations': totalRegistrations
    });

    const ws = XLSX.utils.json_to_sheet(exportData);

    XLSX.utils.book_append_sheet(wb, ws, 'Daily Registrations');

    XLSX.writeFile(wb, 'daily_registrations_report.xlsx');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-amber-950">
          <div className="w-6 h-6 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <Link to="/admin/redirect/user_admin" className="flex items-center space-x-2">
                <Shield className="text-[#D88C6D]" size={24} />
                <span className="text-xl font-bold text-[#4E2D21]">Dashboard</span>
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link to="/ProfessionalRegistration" className="flex items-center space-x-1 text-[#4E2D21] hover:text-[#D88C6D] transition-colors">
                  <UserPlus size={20} />
                  <span>Add Staff</span>
                </Link>
                <Link to="/ProfessionalsList" className="flex items-center space-x-1 text-[#4E2D21] hover:text-[#D88C6D] transition-colors">
                  <Users size={20} />
                  <span>Staff List</span>
                </Link>
                <Link to="/UsersList" className="flex items-center space-x-1 text-[#4E2D21] hover:text-[#D88C6D] transition-colors">
                  <UserCog size={20} />
                  <span>User List</span>
                </Link>
                <Link to="/AdminRegister" className="flex items-center space-x-1 text-[#4E2D21] hover:text-[#D88C6D] transition-colors">
                  <Shield size={20} />
                  <span>Add Admin</span>
                </Link>
              </nav>
            </div>

            {/* Right side - User info and Logout */}
            <div className="flex items-center space-x-4">
              <span className="text-[#4E2D21] font-medium">Welcome, {adminName}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-[#D88C6D] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#4E2D21] transition-colors"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[1300px] bg-white shadow-2xl rounded-2xl p-6 sm:p-12">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <Heart className="text-amber-950 mr-3" size={32} />
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-950">Users List</h2>
          </div>

          {error && (
            <p className="text-center text-sm text-red-500 flex items-center justify-center mb-6">
              <AlertCircle className="mr-2" size={18} /> {error}
            </p>
          )}

          {/* Search Bar */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <div className="relative flex-1 mb-4 sm:mb-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700"
                placeholder="Search by name or email"
                aria-label="Search users by name or email"
              />
              <Search
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={20}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-700 text-white">
                  <th className="p-3 text-sm font-semibold">Profile</th>
                  <th className="p-3 text-sm font-semibold">Name</th>
                  <th className="p-3 text-sm font-semibold">Email</th>
                  <th className="p-3 text-sm font-semibold">Phone Number</th>
                  <th className="p-3 text-sm font-semibold">City</th>
                  <th className="p-3 text-sm font-semibold w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-3 text-center text-gray-700">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`border-b border-amber-200 ${
                        index % 2 === 1 ? 'bg-amber-50' : 'bg-white'
                      } hover:bg-gray-100`}
                    >
                      <td className="p-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                          <img
                            src={user.profilePicture || defaultProfilePic}
                            alt={`${user.name || 'User'}'s profile`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-3 text-gray-900">{user.name || 'N/A'}</td>
                      <td className="p-3 text-gray-900">{user.email || 'N/A'}</td>
                      <td className="p-3 text-gray-900">{user.phoneNumber || 'N/A'}</td>
                      <td className="p-3 text-gray-900">{user.city || 'N/A'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setDeleteConfirm(user._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center text-sm hover:bg-red-700 transition-colors"
                          aria-label={`Delete user ${user.name || 'Unknown'}`}
                        >
                          <Trash2 size={16} className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart Section */}
        <div className="w-full max-w-[1300px] bg-white shadow-2xl rounded-2xl p-6 sm:p-12 mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Heart className="text-amber-950 mr-3" size={32} />
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-950">User Registration Analytics</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExportReport}
              className="flex items-center space-x-2 bg-amber-700 text-white px-4 py-2 rounded-xl font-medium hover:bg-amber-800 transition-colors"
            >
              <Download size={20} />
              <span>Export Analytics</span>
            </motion.button>
          </div>
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {deleteConfirm && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
            onKeyDown={(e) => e.key === 'Escape' && setDeleteConfirm(null)}
            tabIndex={0}
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-[550px] border border-amber-400 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-amber-700"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
              <div className="flex items-center justify-center mb-6">
                <Heart className="text-amber-950 mr-2" size={30} />
                <h3 id="delete-confirm-title" className="text-xl sm:text-2xl font-bold text-amber-950">
                  Confirm Deletion
                </h3>
              </div>
              <p className="text-gray-900 mb-6 text-center">
                Are you sure you want to delete this user's profile? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 py-3 bg-gray-300 text-gray-900 rounded-lg text-md font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProfile(deleteConfirm)}
                  className="px-6 py-3 bg-amber-700 text-white rounded-lg text-md font-semibold hover:bg-amber-800 transition-colors"
                >
                  Delete Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;