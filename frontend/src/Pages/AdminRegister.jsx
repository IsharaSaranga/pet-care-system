import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, Heart, Eye, EyeOff, Shield, UserPlus, Users, UserCog, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admins/register', formData);
      console.log('Admin registered:', response.data);
      navigate('/admin/redirect/user_admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering admin');
    }
  };

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
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Image Section */}
          <div className="w-full md:w-1/2 relative h-64 md:h-auto">
            <div className="absolute inset-0 bg-[url('./assets/addadmin.jpg')] bg-cover bg-center flex items-center justify-center">
              <div className="text-white text-center p-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Add An Admin</h2>
                <p className="text-lg sm:text-xl">Manage Our System</p>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="w-full md:w-1/2 p-6 sm:p-12 overflow-y-auto max-h-screen">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <Heart className="text-[#B3704D] mr-3" size={32} />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#B3704D]">Admin Registration</h2>
            </div>

            {error && (
              <p className="text-center text-sm text-red-500 flex items-center justify-center mb-6">
                <AlertCircle className="mr-2" size={18} /> {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-1.5 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9a7656]"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-1.5 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9a7656]"
                  placeholder="Email"
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="/password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-1.5 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9a7656]"
                  placeholder="Password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-12 text-gray-600 hover:text-gray-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-1.5 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9a7656]"
                >
                  <option value="">Select Role</option>
                  <option value="user_admin">User Admin</option>
                  <option value="event_manager">Event Manager</option>
                  <option value="adoption_manager">Adoption Manager</option>
                  <option value="appointment_manager">Appointment Manager</option>
                  <option value="store_manager">Store Manager</option>
                </select>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#B3704D] text-white px-8 py-3 sm:py-4 rounded-xl text-md sm:text-lg font-semibold hover:bg-[#4E2D21] transition-colors"
                >
                  Register Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;