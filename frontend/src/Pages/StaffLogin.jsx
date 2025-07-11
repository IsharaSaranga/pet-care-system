//edited
// src/Pages/StaffLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Heart, X, Eye, EyeOff } from "lucide-react";

const StaffLogin = () => {
  const [pemail, setPemail] = useState("");
  const [ppassword, setPpassword] = useState("");
  const [professionalErrors, setProfessionalErrors] = useState({});
  const [showPpassword, setShowPpassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const navigate = useNavigate();

  const validateProfessionalForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pemail.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(pemail)) newErrors.email = "Invalid email format";

    if (!ppassword.trim()) newErrors.password = "Password is required";
    else if (ppassword.length < 8) newErrors.password = "Password must be at least 8 characters long";

    setProfessionalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfessionalSubmit = async (e) => {
    e.preventDefault();
    setProfessionalErrors({});

    if (validateProfessionalForm()) {
      try {
        const response = await fetch("http://localhost:5000/api/professionals/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pemail: pemail, ppassword: ppassword }),
        });

        const data = await response.json();

        if (response.ok) {
          // Store professional data with user-type-specific keys
          localStorage.setItem("professionalToken", data.token);
          localStorage.setItem("professionalUser", JSON.stringify({
            _id: data._id,
            name: data.name,
            email: data.email,
            role: "professional"
          }));
          setPemail("");
          setPpassword("");
          navigate("/professional/dashboard");
        } else {
          setProfessionalErrors({ submit: data.message || "Invalid email or password" });
        }
      } catch (error) {
        setProfessionalErrors({ submit: "Server error. Please try again." });
      }
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminError("");

    try {
      const response = await fetch("http://localhost:5000/api/admins/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin data with user-type-specific keys
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminUser", JSON.stringify({
          _id: data.admin._id,
          name: data.admin.name,
          email: data.admin.email,
          role: data.admin.role
        }));
        setEmail("");
        setPassword("");
        setIsAdminModalOpen(false);
        navigate(`/admin/redirect/${data.admin.role}`);
      } else {
        setAdminError(data.message || "Invalid email or password");
      }
    } catch (error) {
      setAdminError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D8] to-[#E6D5C1] flex items-center justify-center p-6 sm:p-12 mt-12">
      <div className="w-full max-w-[800px] bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 relative h-64 md:h-auto">
          <div className="absolute inset-0 bg-[url('./assets/staffRegister.jpg')] bg-cover bg-center flex items-center justify-center">
            <div className="text-white text-center p-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Welcome Back</h2>
              <p className="text-lg sm:text-xl">Login to continue your journey</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-12">
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <Heart className="text-amber-950 mr-3" size={32} />
            <h2 className="text-2xl sm:text-3xl font-bold text-amber-950">Professional Login</h2>
          </div>

          <form onSubmit={handleProfessionalSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="pemail" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="pemail"
                value={pemail}
                onChange={(e) => setPemail(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                  professionalErrors.email ? "border-red-500" : "border-amber-200"
                }`}
                placeholder="your@email.com"
              />
              {professionalErrors.email && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <AlertCircle className="mr-2" size={18} /> {professionalErrors.email}
                </p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="ppassword" className="block text-sm sm:text-md font-medium text-amber-950 mb-2">
                Password
              </label>
              <input
                type={showPpassword ? "text" : "password"}
                id="ppassword"
                value={ppassword}
                onChange={(e) => setPpassword(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                  professionalErrors.password ? "border-red-500" : "border-amber-200"
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPpassword(!showPpassword)}
                className="absolute right-3 top-12 text-gray-500 hover:text-amber-700"
                aria-label={showPpassword ? "Hide password" : "Show password"}
              >
                {showPpassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {professionalErrors.password && (
                <p className="mt-2 text-sm text-red-500 flex items-center">
                  <AlertCircle className="mr-2" size={18} /> {professionalErrors.password}
                </p>
              )}
            </div>

            {professionalErrors.submit && (
              <p className="text-center text-sm text-red-500 flex items-center justify-center">
                <AlertCircle className="mr-2" size={18} /> {professionalErrors.submit}
              </p>
            )}

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="w-full bg-amber-700 text-white px-8 py-3 sm:py-4 rounded-lg text-md sm:text-lg font-semibold hover:bg-amber-800 transition-colors"
              >
                Login
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-900 mt-4">Are you an admin?</p>
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(true)}
                className="mt-2 bg-amber-700 text-white px-6 py-2 rounded-lg text-sm sm:text-md font-semibold hover:bg-amber-800 transition-colors"
              >
                Login as Admin
              </button>
            </div>
          </form>
        </div>
      </div>

      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-[550px] border border-amber-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-amber-700"
            >
              <X size={24} />
            </button>
            <div className="flex items-center justify-center mb-6">
              <Heart className="text-amber-950 mr-2" size={30} />
              <h2 className="text-xl sm:text-2xl font-bold text-amber-950">Admin Login</h2>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-amber-950 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                    adminError ? "border-red-500" : "border-amber-200"
                  }`}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium text-amber-950 mb-1">
                  Password
                </label>
                <input
                  type={showAdminPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border border-amber-200 text-gray-900 bg-white focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 ${
                    adminError ? "border-red-500" : "border-amber-200"
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-10 text-gray-500 hover:text-amber-700"
                  aria-label={showAdminPassword ? "Hide password" : "Show password"}
                >
                  {showAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {adminError && (
                <p className="text-center text-sm text-red-500 flex items-center justify-center">
                  <AlertCircle className="mr-2" size={16} /> {adminError}
                </p>
              )}

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="w-full bg-amber-700 text-white px-6 py-3 rounded-lg text-md font-semibold hover:bg-amber-800 transition-colors"
                >
                  Login as Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffLogin;