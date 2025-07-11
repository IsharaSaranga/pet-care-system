import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import UserLoginImg from "../assets/profflogin.jpeg"; 

const ProfLoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/professionals/profflogin',
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      // Store token and role in localStorage
      localStorage.setItem('profToken', response.data.token);
      localStorage.setItem('profRole', response.data.professional.role);

      // Redirect based on role
      switch (response.data.professional.role) {
        case 'groomer':
          navigate('/professional/redirect/');
          break;
        case 'vet':
          navigate('/professional/redirect/');
          break;
        case 'pet-trainer':
          navigate('/professional/redirect/');
          break;
        default:
          navigate('/professional/redirect/');
      }
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = err.response.data.error || 'Invalid credentials';
        } else if (err.response.status === 404) {
          errorMessage = 'Professional not found';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF5E6] via-[#FCF0E4] to-[#F5EFEA] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="flex max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side image */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center">
          <img src={UserLoginImg} alt="Professional Login" className="object-cover w-full h-full p-5" />
        </div>
        
        {/* Right side form */}
        <div className="w-full md:w-1/2 space-y-8 p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-amber-950">
              Professional Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Login to access your professional dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p>{error}</p>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="block text-amber-950 font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 bg-white text-gray-900"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-amber-950 font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 bg-white text-gray-900"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-10 text-gray-500 hover:text-amber-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-700 hover:bg-amber-800'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-700`}
              >
                {loading ? 'Logging in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-900">
              Forgot your password?{" "}
              <Link to="/forgot-password" className="text-amber-700 hover:underline font-medium">
                Reset Password
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-900">
              Not a registered professional?{" "}
              <Link to="/professional/signup" className="text-amber-700 hover:underline font-medium">
                Register Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfLoginPage;