import { Navigate } from "react-router-dom";

const AdminPrivateRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");
  // Redirect to user frontend's admin-login if token is missing
  return token ? children : <Navigate to="http://localhost:3000/admin-login" replace />;
};

export default AdminPrivateRoute;