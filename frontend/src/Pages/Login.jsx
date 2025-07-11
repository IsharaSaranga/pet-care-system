import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import UserLoginImg from "../assets/UserLogin.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination and its state from location state
  const from = location.state?.from?.pathname || "/";
  const fromState = location.state?.from?.state;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
        }));
        // Navigate to the intended destination with its state
        navigate(from, { state: fromState, replace: true });
        window.location.reload();
      } else {
        setLoginError(data.message || "Invalid email or password");
      }
    } catch (error) {
      setLoginError(error.message || "Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF5E6] via-[#FCF0E4] to-[#F5EFEA] py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="flex max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side image */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center bg-amber-">
          <img src={UserLoginImg} alt="User Login" className="object-cover w-full h-full p-5" />
        </div>
        {/* Right side form */}
        <div className="w-full md:w-1/2 space-y-8 p-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-amber-950">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Login to continue your journey
            </p>
          </div>
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
              <p>{loginError}</p>
            </div>
          )}
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-700 focus:ring-amber-700 border-amber-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-700"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-900">
              Don't have an account?{" "}
              <Link to="/signup" className="text-amber-700 hover:underline font-medium">
                Register
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-900">
              Are you a staff member?{" "}
              <Link to="/stafflogin" className="text-amber-700 hover:underline font-medium">
                Staff Member Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 