//edited
// src/Component/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const location = useLocation();

  // Determine user type based on the route
  let userType = "petOwner"; // Default to pet owner
  if (location.pathname.startsWith("/admin/redirect")) {
    userType = "admin";
  } else if (location.pathname.startsWith("/professional")) {
    userType = "professional";
  }

  // Get token and user data for the specific user type
  const token = localStorage.getItem(`${userType}Token`);
  const user = JSON.parse(localStorage.getItem(`${userType}User`));

  // Check if user is authenticated
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-based access checks for admin routes
  if (
    location.pathname.startsWith("/admin/redirect/appointment_manager") &&
    user.role !== "appointment_manager"
  ) {
    return <Navigate to="/stafflogin" replace />;
  }

  if (
    location.pathname.startsWith("/admin/redirect/event_admin") &&
    user.role !== "event_admin"
  ) {
    return <Navigate to="/stafflogin" replace />;
  }

  if (
    location.pathname.startsWith("/admin/redirect/user_admin") &&
    user.role !== "user_admin"
  ) {
    return <Navigate to="/stafflogin" replace />;
  }

   // Store manager role check
  if (
    (location.pathname.startsWith("/store-admin") || 
     location.pathname.startsWith("/admin/redirect/store_manager")) &&
    user.role !== "store_manager"
  ) {
    return <Navigate to="/stafflogin" replace />;
  }

  // Role-based access check for professional routes
  if (
    location.pathname.startsWith("/professional") &&
    user.role !== "professional"
  ) {
    return <Navigate to="/stafflogin" replace />;
  }

  return children;
};

export default PrivateRoute;