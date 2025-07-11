import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const AdminRedirect = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("AdminRedirect - Token:", token);

    if (!token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/staff-login");
      return;
    }

    switch (role) {
      case "event_manager":
        window.location.href = "http://localhost:3001/";
        break;
      case "user_admin":
        window.location.href = "http://localhost:3002/";
        break;
      case "adoption_manager":
        window.location.href = "http://localhost:3003/";
        break;
      case "appointment_manager":
        window.location.href = "http://localhost:3004/";
        break;
      case "store_manager":
        window.location.href = "http://localhost:3005/";
        break;
      default:
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/staff-login");
    }
  }, [role, navigate]);

  return null; // No UI, just redirection
};

export default AdminRedirect;