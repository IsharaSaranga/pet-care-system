import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import UserRegisterImg from "../assets/UserRegister.jpg";

export default function Signup() {
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhoneNumber, setRegPhoneNumber] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [conPassword, setConPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [regError, setRegError] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConPassword, setShowConPassword] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = (field) => {
    if (field === "register") {
      setShowRegPassword(!showRegPassword);
    } else if (field === "confirm") {
      setShowConPassword(!showConPassword);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError("");
    if (regPassword !== conPassword) {
      setRegError("Passwords do not match");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phoneNumber: regPhoneNumber,
          city: regCity,
          password: regPassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.user.token);
        localStorage.setItem("user", JSON.stringify({
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          phoneNumber: data.user.phoneNumber,
          city: data.user.city,
        }));
        navigate("/");
        window.location.reload();
      } else {
        setRegError(data.message || "Registration failed");
      }
    } catch (error) {
      setRegError(error.message || "Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF5E6] via-[#FCF0E4] to-[#F5EFEA] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="flex max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side image */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center ">
          <img src={UserRegisterImg} alt="User Register" className="object-cover w-full h-full p-5" />
        </div>
        {/* Right side form */}
        <div className="w-full md:w-1/2 space-y-8 p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-amber-950">
              Create Your Account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join us to start your journey
            </p>
          </div>
          {regError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p>{regError}</p>
            </div>
          )}
          <form className="mt-8 space-y-6" onSubmit={handleRegisterSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="block text-amber-950 font-medium mb-1">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 bg-white text-gray-900"
                  placeholder="Enter your full name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-amber-950 font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 bg-white text-gray-900"
                  placeholder="your@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-amber-950 font-medium mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 bg-white text-gray-900"
                  placeholder="(123) 456-7890"
                  value={regPhoneNumber}
                  onChange={(e) => setRegPhoneNumber(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-amber-950 font-medium mb-1">
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 bg-white text-gray-900"
                  placeholder="Enter your city"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="block text-amber-950 font-medium mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showRegPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 bg-white text-gray-900"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("register")}
                  className="absolute right-3 top-9 text-gray-500 hover:text-amber-700"
                  aria-label={showRegPassword ? "Hide password" : "Show password"}
                >
                  {showRegPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="relative">
                <label htmlFor="confirm-password" className="block text-amber-950 font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 bg-white text-gray-900"
                  placeholder="••••••••"
                  value={conPassword}
                  onChange={(e) => setConPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-9 text-gray-500 hover:text-amber-700"
                  aria-label={showConPassword ? "Hide password" : "Show password"}
                >
                  {showConPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div>
                <label htmlFor="profile-pic" className="block text-amber-950 font-medium mb-1">
                  Profile Picture
                </label>
                <input
                  id="profile-pic"
                  name="profile-pic"
                  type="file"
                  className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700 bg-white text-gray-900"
                  onChange={(e) => setProfilePic(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-700"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-900">
              Already have an account?{" "}
              <Link to="/login" className="text-amber-700 hover:underline font-medium">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 