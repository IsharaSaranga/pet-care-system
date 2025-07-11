import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Heart, Eye, EyeOff, Shield, UserPlus, Users, UserCog, LogOut } from "lucide-react";
import { motion } from "framer-motion";

const ProfessionalRegistration = () => {
  const [formData, setFormData] = useState({
    pName: "",
    role: "groomer",
    pID: "",
    pemail: "",
    ppassword: "",
    pphoneNumber: "",
    qualification: "",
    experience: "",
    description: "",
    pIDNumber: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [errors, setErrors] = useState({});
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

  const getPIDPrefix = (role) => {
    switch (role) {
      case "groomer":
        return "gro";
      case "vet":
        return "vet";
      case "pet-trainer":
        return "pet";
      default:
        return "";
    }
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      pID: `${getPIDPrefix(prev.role)}${prev.pIDNumber}`,
    }));
  }, [formData.role, formData.pIDNumber]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const pidNumberRegex = /^\d{3}$/;

    if (!formData.pName.trim()) newErrors.pName = "Name is required";
    if (!formData.pIDNumber.trim()) newErrors.pIDNumber = "Professional ID number is required";
    else if (!pidNumberRegex.test(formData.pIDNumber))
      newErrors.pIDNumber = "Professional ID number must be exactly 3 digits";
    if (!formData.pemail.trim()) newErrors.pemail = "Email is required";
    else if (!emailRegex.test(formData.pemail)) newErrors.pemail = "Invalid email format";
    if (!formData.ppassword.trim()) newErrors.ppassword = "Password is required";
    else if (formData.ppassword.length < 8) newErrors.ppassword = "Password must be at least 8 characters";
    if (!formData.pphoneNumber.trim()) newErrors.pphoneNumber = "Phone number is required";
    else if (!phoneRegex.test(formData.pphoneNumber))
      newErrors.pphoneNumber = "Phone number must be exactly 10 digits";
    if (!formData.qualification.trim()) newErrors.qualification = "Qualification is required";
    if (!formData.experience.trim()) newErrors.experience = "Experience is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (validateForm()) {
      try {
        const formDataToSend = new FormData();
        
        // Append all form fields
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataToSend.append(key, value);
          }
        });

        // Append profile picture if exists
        if (profilePicture) {
          formDataToSend.append("profilePicture", profilePicture);
        }

        console.log("Submitting form data:", {
          pName: formData.pName,
          role: formData.role,
          pID: formData.pID,
          pemail: formData.pemail,
          pphoneNumber: formData.pphoneNumber,
          qualification: formData.qualification,
          experience: formData.experience,
          description: formData.description,
          hasProfilePicture: !!profilePicture
        });

        const response = await fetch("http://localhost:5000/api/professionals/register", {
          method: "POST",
          body: formDataToSend,
        });

        const data = await response.json();

        if (response.ok) {
          alert("Registration successful! Please wait for verification.");
          setFormData({
            pName: "",
            role: "groomer",
            pID: "",
            pemail: "",
            ppassword: "",
            pphoneNumber: "",
            qualification: "",
            experience: "",
            description: "",
            pIDNumber: "",
          });
          setProfilePicture(null);
          navigate("/ProfessionalRegistration");
        } else {
          console.error("Registration failed:", data);
          setErrors({ submit: data.message || "Registration failed" });
        }
      } catch (error) {
        console.error("Registration error:", error);
        setErrors({ submit: "Server error. Please try again." });
      }
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
        <div className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 relative h-64 md:h-auto">
            <div
              className="absolute inset-0 bg-[url('./assets/staffRegister.jpg')] bg-cover bg-center flex items-center justify-center"
            >
              <div className="text-white text-center p-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Add Professional</h2>
                <p className="text-lg sm:text-xl">Improve our System</p>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-6 sm:p-12 overflow-y-auto max-h-screen">
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              <Heart className="text-[#B3704D] mr-3" size={32} />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#B3704D]">Professional Registration</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="pName" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="pName"
                  name="pName"
                  value={formData.pName}
                  onChange={handleChange}
                  className={`w-full px-4 py-1.5 rounded-xl border-2 ${
                    errors.pName ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#9a7656]`}
                  placeholder="Full Name"
                />
                {errors.pName && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertCircle className="mr-2" size={18} /> {errors.pName}
                  </p>
                )}
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
                  className="w-full px-4 py-1.5 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9a7656]"
                >
                  <option value="groomer">Groomer</option>
                  <option value="vet">Veterinarian</option>
                  <option value="pet-trainer">Pet Trainer</option>
                </select>
              </div>

              <div>
                <label htmlFor="pIDNumber" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Professional ID Number (3 digits)
                </label>
                <div className="flex items-center">
                  <span className="inline-block px-4 py-3 bg-gray-100 rounded-l-xl border-2 border-r-0 border-gray-300 text-gray-700">
                    {getPIDPrefix(formData.role)}
                  </span>
                  <input
                    type="text"
                    id="pIDNumber"
                    name="pIDNumber"
                    value={formData.pIDNumber}
                    onChange={handleChange}
                    className={`w-full px-4 py-1.5 rounded-r-xl border-2 ${
                      errors.pIDNumber ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#9a7656]`}
                    placeholder="123"
                    maxLength="3"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Generated ID: {formData.pID || "Select role and enter 3 digits"}</p>
                {errors.pIDNumber && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertCircle className="mr-2" size={18} /> {errors.pIDNumber}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="pemail" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="pemail"
                  name="pemail"
                  value={formData.pemail}
                  onChange={handleChange}
                  className={`w-full px-4 py-1.5 rounded-xl border-2 ${
                    errors.pemail ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#9a7656]`}
                  placeholder="Email"
                />
                {errors.pemail && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertCircle className="mr-2" size={18} /> {errors.pemail}
                  </p>
                )}
              </div>

              <div className="relative">
                <label htmlFor="ppassword" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="ppassword"
                  name="ppassword"
                  value={formData.ppassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-1.5 rounded-xl border-2 ${
                    errors.ppassword ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#9a7656]`}
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
                {errors.ppassword && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertCircle className="mr-2" size={18} /> {errors.ppassword}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="pphoneNumber" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  id="pphoneNumber"
                  name="pphoneNumber"
                  value={formData.pphoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-1.5 rounded-xl border-2 ${
                    errors.pphoneNumber ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#9a7656]`}
                  placeholder="Phone Number (10 digits)"
                  maxLength="10"
                />
                {errors.pphoneNumber && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertCircle className="mr-2" size={18} /> {errors.pphoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="qualification" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className={`w-full px-4 py-1.5 rounded-xl border-2 ${
                    errors.qualification ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#9a7656]`}
                  placeholder="Qualification"
                />
                {errors.qualification && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertCircle className="mr-2" size={18} /> {errors.qualification}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Experience
                </label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className={`w-full px-4 py-1.5 rounded-xl border-2 ${
                    errors.experience ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#9a7656]`}
                  placeholder="Years of Experience"
                />
                {errors.experience && (
                  <p className="mt-2 text-sm text-red-500 flex items-center">
                    <AlertCircle className="mr-2" size={18} /> {errors.experience}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="profilePicture" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Profile Picture (Optional)
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={(e) => setProfilePicture(e.target.files[0])}
                  className="w-full px-4 py-1.5 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9a7656]"
                  accept="image/jpeg,image/png"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm sm:text-md font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-1.5 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#9a7656]"
                  placeholder="Brief Description"
                  rows="4"
                />
              </div>

              {errors.submit && (
                <p className="text-center text-sm text-red-500 flex items-center justify-center">
                  <AlertCircle className="mr-2" size={18} /> {errors.submit}
                </p>
              )}

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#B3704D] text-white px-8 py-3 sm:py-4 rounded-xl text-md sm:text-lg font-semibold hover:bg-[#4E2D21] transition-colors"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalRegistration;