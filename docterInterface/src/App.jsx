import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Doctor_Sidebar from "./Component/Doctor_Header";
import DoctorHomePage from "./pages/Doctor_Home_Page";
import Doctor_Appointment_View_Page from "./pages/Doctor_Appointment_View_Page";
import DoctorAvlPage from "./pages/Docter_Avl_Page";
import DoctorProfilePage from "./pages/Pet_Profile_Page";
import ProfLoginPage from "./pages/ProfLoginPage";
import GenerateReportPage from "./pages/GenerateReportPage";
import ViewSummaryPage from "./pages/ViewSummaryPage";
import PetDetailsPage from './pages/PetDetailsPage';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('profToken');
  return token ? children : <Navigate to="/profflogin" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/profflogin" element={<ProfLoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex">
                <Doctor_Sidebar />
                <div className="lg:ml-64 flex-1 p-6">
                  <Routes>
                    <Route path="/professional/redirect/" element={<DoctorHomePage />} />
                    <Route path="/professional/redirect/view-appointments" element={<Doctor_Appointment_View_Page />} />
                    <Route path="/professional/redirect/create-availability" element={<DoctorAvlPage />} />
                    <Route path="/professional/redirect/view-pet-details" element={<DoctorProfilePage />} />
                    <Route path="/professional/redirect/generate-report" element={<GenerateReportPage />} />
                    <Route path="/professional/redirect/view-summary" element={<ViewSummaryPage />} />
                    <Route path="/professional/appointment/:appointmentId/pet-details" element={<PetDetailsPage />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;