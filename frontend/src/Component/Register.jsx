import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phoneNumber, city, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.user.token); // Store token
        navigate("/events"); // Redirect to events after registration
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5EFEA]">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-[#D08860]/20">
        <h2 className="text-2xl font-semibold text-center text-amber-950 mb-6">Create Your Account</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-amber-900 font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:border-[#D08860] focus:ring-1 focus:ring-[#D08860] bg-amber-50/50 text-amber-900"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-amber-900 font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:border-[#D08860] focus:ring-1 focus:ring-[#D08860] bg-amber-50/50 text-amber-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-amber-900 font-medium mb-1">Phone Number</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:border-[#D08860] focus:ring-1 focus:ring-[#D08860] bg-amber-50/50 text-amber-900"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              placeholder="(123) 456-7890"
            />
          </div>
          <div>
            <label className="block text-amber-900 font-medium mb-1">City</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:border-[#D08860] focus:ring-1 focus:ring-[#D08860] bg-amber-50/50 text-amber-900"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="Enter your city"
            />
          </div>
          <div>
            <label className="block text-amber-900 font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-amber-200 rounded-lg focus:outline-none focus:border-[#D08860] focus:ring-1 focus:ring-[#D08860] bg-amber-50/50 text-amber-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#D08860] text-white py-3 rounded-lg hover:bg-[#B3714E] transition-colors duration-300 font-medium mt-2"
          >
            Create Account
          </button>
        </form>
        <p className="text-center text-amber-900 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-[#D08860] hover:underline font-medium">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;