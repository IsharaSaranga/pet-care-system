'use client';

import { useState, useEffect, useContext } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, EyeIcon, EyeSlashIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";

export default function UserHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhoneNumber, setRegPhoneNumber] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [conPassword, setConPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [regError, setRegError] = useState("");
  const [regErrors, setRegErrors] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const [intendedPath, setIntendedPath] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConPassword, setShowConPassword] = useState(false);
  const navigate = useNavigate();
  const { getCartCount } = useContext(ShopContext);

  const [petOwnerToken, setPetOwnerToken] = useState(localStorage.getItem("petOwnerToken"));

  const togglePasswordVisibility = (field) => {
    if (field === "login") {
      setShowPassword(!showPassword);
    } else if (field === "register") {
      setShowRegPassword(!showRegPassword);
    } else if (field === "confirm") {
      setShowConPassword(!showConPassword);
    }
  };

  const validateToken = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/profile", {
        headers: {
          "Authorization": `Bearer ${petOwnerToken}`,
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("petOwnerToken", data.token);
        localStorage.setItem("petOwnerUser", JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          city: data.city,
          role: "pet_owner"
        }));
        setPetOwnerToken(data.token);
        setLoginOpen(false);
        setEmail("");
        setPassword("");
        navigate(intendedPath || "/");
      } else {
        setLoginError(data.message || "Invalid email or password");
      }
    } catch (error) {
      setLoginError(error.message || "Server error. Please try again.");
    }
  };

  const validateRegistrationForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;

    if (!regName.trim()) {
      errors.name = "Name is required";
    }

    if (!regEmail.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(regEmail)) {
      errors.email = "Please enter a valid email address";
    }

    if (!regPhoneNumber.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(regPhoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number (e.g., (123) 456-7890)";
    }

    if (!regCity.trim()) {
      errors.city = "City is required";
    }

    if (!regPassword) {
      errors.password = "Password is required";
    } else if (regPassword.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    if (!conPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (regPassword !== conPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    
    if (!validateRegistrationForm()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", regName);
      formData.append("email", regEmail);
      formData.append("phoneNumber", regPhoneNumber);
      formData.append("city", regCity);
      formData.append("password", regPassword);
      if (profilePic) {
        formData.append("profilePicture", profilePic);
      }
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("petOwnerToken", data.user.token);
        localStorage.setItem("petOwnerUser", JSON.stringify({
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          phoneNumber: data.user.phoneNumber,
          city: data.user.city,
          profilePicture: data.user.profilePicture,
          role: "pet_owner"
        }));
        setPetOwnerToken(data.user.token);
        setRegisterOpen(false);
        setRegName("");
        setRegEmail("");
        setRegPhoneNumber("");
        setRegCity("");
        setRegPassword("");
        setConPassword("");
        setProfilePic(null);
        setRegErrors({});
        navigate(intendedPath || "/");
      } else {
        setRegError(data.message || "Registration failed");
      }
    } catch (error) {
      setRegError(error.message || "Server error. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("petOwnerToken");
    localStorage.removeItem("petOwnerUser");
    setPetOwnerToken(null);
    setIntendedPath("");
    setLoginOpen(false);
    setRegisterOpen(false);
    setEmail("");
    setPassword("");
    setRegName("");
    setRegEmail("");
    setRegPhoneNumber("");
    setRegCity("");
    setRegPassword("");
    setConPassword("");
    setLoginError("");
    setRegError("");
    navigate("/");
  };

  const handleNavClick = async (path) => {
    const publicRoutes = ["/", "/aboutus", "/contactus", "/events", "/appointment", "/adoption", "/collection"];
    if (!petOwnerToken && !publicRoutes.includes(path)) {
      setIntendedPath(path);
      setLoginOpen(true);
    } else if (path === "/profile" && petOwnerToken) {
      const isValid = await validateToken();
      if (isValid) {
        setMobileMenuOpen(false);
        navigate(path);
      } else {
        localStorage.removeItem("petOwnerToken");
        localStorage.removeItem("petOwnerUser");
        setPetOwnerToken(null);
        setIntendedPath(path);
        setLoginOpen(true);
      }
    } else {
      setMobileMenuOpen(false);
      navigate(path);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg shadow-neumorphic">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between py-4 px-4 lg:px-8">
        <div className="flex lg:flex-1">
          <Link to="/">
            <span className="sr-only">Pet Care</span>
            <img src="/logo.jpg" alt="Pet Care Logo" className="h-12 w-auto rounded-xl shadow-neumorphic hover:shadow-neumorphic-hover transition-all duration-300 transform hover:scale-105" />
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-gradient-to-r from-[#D08860]/10 to-[#B3704D]/10 text-[#D08860] hover:bg-[#D08860]/20 transition-all duration-300 transform hover:scale-105"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8 items-center">
          {[
            { to: "/", label: "Home" },
            { to: "/appointment", label: "Appointment" },
            { to: "/collection", label: "Marketplace" },
            { to: "/events", label: "Events" },
            { to: "/adoption", label: "Adoption" },
            { to: "/aboutus", label: "About Us" },
            { to: "/contactus", label: "Contact Us" },
            { to: "/profile", label: "Profile" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => handleNavClick(item.to)}
              className="text-sm font-semibold text-gray-900 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#D08860] hover:to-[#B3704D] transition-all duration-300"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/cart" className="relative p-2">
            <ShoppingCartIcon className="w-6 h-6 text-[#D08860] animate-pulse" />
            <span className="absolute right-[-6px] bottom-[-6px] w-5 h-5 flex items-center justify-center bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-full text-xs font-bold shadow-neumorphic">
              {getCartCount()}
            </span>
          </Link>
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {petOwnerToken ? (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-gray-200/50 text-gray-700 rounded-lg hover:bg-gray-300/50 transition-colors duration-300 text-sm"
            >
              Log Out
            </button>
          ) : (
            <>
              <button
                onClick={() => setLoginOpen(true)}
                className="px-6 py-2 bg-white/10 border-2 border-[#D08860] text-[#D08860] rounded-xl hover:bg-gradient-to-r hover:from-[#D08860] hover:to-[#B3704D] hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                Log In
              </button>
              <button
                onClick={() => setRegisterOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D] text-white rounded-xl shadow-neumorphic hover:shadow-neumorphic-hover transition-all duration-300 transform hover:scale-105"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto bg-white/10 backdrop-blur-lg px-6 py-6 sm:ring-1 sm:ring-[#D08860]/20 animate-slideInRight">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">Pet Care</span>
              <img src="/logo.jpg" alt="Logo" className="h-10 w-auto rounded-xl shadow-neumorphic" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-gradient-to-r from-[#D08860]/10 to-[#B3704D]/10 text-[#D08860] hover:bg-[#D08860]/20 transition-all duration-300"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-[#D08860]/20">
              <div className="space-y-2 py-6">
                {[
                  { to: "/", label: "Home" },
                  { to: "/appointment", label: "Appointment" },
                  { to: "/collection", label: "Marketplace" },
                  { to: "/events", label: "Events" },
                  { to: "/adoption", label: "Adoption" },
                  { to: "/aboutus", label: "About Us" },
                  { to: "/contactus", label: "Contact Us" },
                  { to: "/profile", label: "Profile" },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => handleNavClick(item.to)}
                    className="-mx-3 block rounded-xl px-3 py-2 text-base font-semibold text-gray-900 hover:bg-[#D08860]/10 hover:text-[#D08860] transition-all duration-300"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link to="/cart" className="relative -mx-3 block px-3 py-2">
                  <div className="flex items-center">
                    <ShoppingCartIcon className="w-6 h-6 text-[#D08860] animate-pulse" />
                    <span className="ml-2 text-base font-semibold text-gray-900">Cart</span>
                    <span className="absolute right-3 top-2 w-5 h-5 flex items-center justify-center bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-full text-xs font-bold shadow-neumorphic">
                      {getCartCount()}
                    </span>
                  </div>
                </Link>
              </div>
              <div className="py-6 space-y-2">
                {petOwnerToken ? (
                  <button
                    onClick={handleLogout}
                    className="w-full px-2.5 py-1.5 bg-gray-200/50 text-gray-700 rounded-lg hover:bg-gray-300/50 transition-colors duration-300 text-sm"
                  >
                    Log Out
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setLoginOpen(true);
                      }}
                      className="w-full px-3 py-2.5 bg-white/10 border-2 border-[#D08860] text-[#D08860] rounded-xl hover:bg-gradient-to-r hover:from-[#D08860] hover:to-[#B3704D] hover:text-white transition-all duration-300 transform hover:scale-105"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setRegisterOpen(true);
                      }}
                      className="w-full px-3 py-2.5 bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D] text-white rounded-xl shadow-neumorphic hover:shadow-neumorphic-hover transition-all duration-300 transform hover:scale-105"
                    >
                      Register
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>

      <Dialog open={loginOpen} onClose={() => setLoginOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true"/>
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
          <DialogPanel className="bg-white/10 backdrop-blur-lg p-0 rounded-3xl shadow-2xl w-full max-w-4xl border border-[#D08860]/20 max-h-[90vh] overflow-y-auto flex flex-col md:flex-row animate-zoomIn">
            <div
              className="w-full md:w-1/2 h-64 md:h-auto bg-cover bg-center rounded-t-3xl md:rounded-l-3xl bg-[url('./assets/UserLogin.jpg')] flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="text-white text-center p-8 bg-black/30 backdrop-blur-sm rounded-xl">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">
                  Welcome Back
                </h1>
                <p className="text-lg md:text-xl">Login to continue your journey</p>
              </div>
            </div>
            <div className="w-full md:w-1/2 p-8">
              <button
                onClick={() => setLoginOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-all duration-300"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl md:text-3xl font-extrabold text-center text-white mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">
                Welcome Back
              </h1>
              {loginError && (
                <div className="mb-4 p-4 bg-red-500/20 border-l-4 border-red-500 text-red-200 rounded-xl animate-slideIn">
                  <p>{loginError}</p>
                </div>
              )}
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-white/10 border border-[#D08860]/50 rounded-xl focus:outline-none focus:border-[#D08860] focus:ring-2 focus:ring-[#D08860]/50 text-white placeholder-white/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div className="relative">
                  <label className="block text-white/90 font-medium mb-2">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 bg-white/10 border border-[#D08860]/50 rounded-xl focus:outline-none focus:border-[#D08860] focus:ring-2 focus:ring-[#D08860]/50 text-white placeholder-white/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("login")}
                    className="absolute right-3 top-11 text-white/70 hover:text-[#D08860] transition-all duration-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-[#D08860] focus:ring-[#D08860] border-[#D08860]/50 rounded bg-white/10"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-white/90">
                      Remember me
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D] text-white py-3 rounded-xl shadow-neumorphic hover:shadow-neumorphic-hover transition-all duration-300 transform hover:scale-105"
                >
                  Log In
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-white/90">
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setLoginOpen(false);
                      setRegisterOpen(true);
                    }}
                    className="text-[#D08860] hover:text-[#B3704D] hover:underline font-medium transition-all duration-300"
                  >
                    Register
                  </button>
                </p>
              </div>
              <div className="mt-4 text-center">
                <p className="text-white/90">
                  Are you a staff member?{" "}
                  <Link to="/StaffLogin">
                    <button
                      type="button"
                      className="text-[#D08860] hover:text-[#B3704D] hover:underline font-medium transition-all duration-300"
                    >
                      Staff Member Login
                    </button>
                  </Link>
                </p>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
          <DialogPanel className="bg-white/10 backdrop-blur-lg p-0 rounded-3xl shadow-2xl w-full max-w-4xl border border-[#D08860]/20 max-h-[90vh] overflow-y-auto flex flex-col md:flex-row animate-zoomIn">
            <div className="w-full md:w-1/2 p-8">
              <button
                onClick={() => setRegisterOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-all duration-300"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h2 className="text-2xl md:text-3xl font-extrabold text-center text-white mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">
                Create Your Account
              </h2>
              {regError && (
                <div className="mb-4 p-4 bg-red-500/20 border-l-4 border-red-500 text-red-200 rounded-xl animate-slideIn">
                  <p>{regError}</p>
                </div>
              )}
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      regErrors.name ? "border-red-500" : "border-[#D08860]/50"
                    } rounded-xl focus:outline-none focus:border-[#D08860] focus:ring-2 focus:ring-[#D08860]/50 text-white placeholder-white/50`}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                  />
                  {regErrors.name && (
                    <p className="mt-1 text-sm text-red-400">{regErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-2">Email</label>
                  <input
                    type="email"
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      regErrors.email ? "border-red-500" : "border-[#D08860]/50"
                    } rounded-xl focus:outline-none focus:border-[#D08860] focus:ring-2 focus:ring-[#D08860]/50 text-white placeholder-white/50`}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                  />
                  {regErrors.email && (
                    <p className="mt-1 text-sm text-red-400">{regErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-2">Phone Number</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      regErrors.phoneNumber ? "border-red-500" : "border-[#D08860]/50"
                    } rounded-xl focus:outline-none focus:border-[#D08860] focus:ring-2 focus:ring-[#D08860]/50 text-white placeholder-white/50`}
                    value={regPhoneNumber}
                    onChange={(e) => setRegPhoneNumber(e.target.value)}
                    required
                    placeholder="(123) 456-7890"
                  />
                  {regErrors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-400">{regErrors.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-2">City</label>
                  <input
                    type="text"
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      regErrors.city ? "border-red-500" : "border-[#D08860]/50"
                    } rounded-xl focus:outline-none focus:border-[#D08860] focus:ring-2 focus:ring-[#D08860]/50 text-white placeholder-white/50`}
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    required
                    placeholder="Enter your city"
                  />
                  {regErrors.city && (
                    <p className="mt-1 text-sm text-red-400">{regErrors.city}</p>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-white/90 font-medium mb-2">Password</label>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      regErrors.password ? "border-red-500" : "border-[#D08860]/50"
                    } rounded-xl focus:outline-none focus:border-[#D08860] focus:ring-2 focus:ring-[#D08860]/50 text-white placeholder-white/50`}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("register")}
                    className="absolute right-3 top-11 text-white/70 hover:text-[#D08860] transition-all duration-300"
                    aria-label={showRegPassword ? "Hide password" : "Show password"}
                  >
                    {showRegPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  {regErrors.password && (
                    <p className="mt-1 text-sm text-red-400">{regErrors.password}</p>
                  )}
                </div>
                <div className="relative">
                  <label className="block text-white/90 font-medium mb-2">Confirm Password</label>
                  <input
                    type={showConPassword ? "text" : "password"}
                    className={`w-full px-4 py-3 bg-white/10 border ${
                      regErrors.confirmPassword ? "border-red-500" : "border-[#D08860]/50"
                    } rounded-xl focus:outline-none focus:border-[#D08860] focus:ring-2 focus:ring-[#D08860]/50 text-white placeholder-white/50`}
                    value={conPassword}
                    onChange={(e) => setConPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-11 text-white/70 hover:text-[#D08860] transition-all duration-300"
                    aria-label={showConPassword ? "Hide password" : "Show password"}
                  >
                    {showConPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  {regErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{regErrors.confirmPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-white/90 font-medium mb-2">Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 bg-white/10 border border-[#D08860]/50 rounded-xl text-white placeholder-white/50 file:bg-[#D08860]/20 file:text-white file:border-none file:rounded-xl file:px-4 file:py-2"
                    onChange={(e) => setProfilePic(e.target.files[0])}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#D08860] via-[#E6A77C] to-[#B3704D] text-white py-3 rounded-xl shadow-neumorphic hover:shadow-neumorphic-hover transition-all duration-300 transform hover:scale-105"
                >
                  Create Account
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-white/90">
                  Already have an account?{" "}
                  <button
                    onClick={() => {
                      setRegisterOpen(false);
                      setLoginOpen(true);
                    }}
                    className="text-[#D08860] hover:text-[#B3704D] hover:underline font-medium transition-all duration-300"
                  >
                    Log In
                  </button>
                </p>
              </div>
            </div>
            <div
              className="w-full md:w-1/2 h-64 md:h-auto bg-cover bg-center rounded-b-3xl md:rounded-r-3xl bg-[url('./assets/UserRegister.jpg')] flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="text-white text-center p-8 bg-black/30 backdrop-blur-sm rounded-xl">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">
                  Join with Us
                </h2>
                <p className="text-lg md:text-xl">Register to start your journey</p>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideInRight {
          animation: slideInRight 0.4s ease-out forwards;
        }
        .animate-zoomIn {
          animation: zoomIn 0.4s ease-out forwards;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
        .shadow-neumorphic {
          box-shadow: 8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.7);
        }
        .shadow-neumorphic-hover {
          box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.15), -4px -4px 8px rgba(255, 255, 255, 0.9);
        }
        .font-sans {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </header>
  );
}