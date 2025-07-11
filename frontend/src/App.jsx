import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserHeader from "./Component/UserHeader";
import UserFooter from "./Component/UserFooter";
import PetPlatformHomePage from "./Component/PetPlatformHomePage";
import AboutUs from "./Component/AboutUs";
import StaffLogin from "./Pages/StaffLogin";
import ContactUs from "./Component/ContactUs";
import PrivateRoute from "./Component/PrivateRoute";
import ProfessionalRegistration from "./Pages/professionalRegistration";
import ProfessionalEdit from "./Pages/ProfessionalEdit"
import PetEdit from "./Pages/PetEdit";
import PetRegister from "./Pages/PetRegister";
import UserEdit from "./Pages/UserEdit";
import ProfilePage from "./Component/UserProfileViewAppointment";
import SysAdminDashboard from "./Pages/SysAdminDashboard";
import UsersList from "./Pages/UsersList";
import ProfessionalsList from "./Pages/ProfessionalsList";
import AdminRegister from "./Pages/AdminRegister";
import AdoptionHomePage from "./Pages/AdoptionHomePage";
import AdoptablePetList from "./Pages/AdoptablePetList";
import AddForAdoption from "./Pages/AddForAdoption";
import AdoptionForm from "./Pages/AdoptionForm";
import PetOwnerDashboard from "./Pages/PetOwnerDashboard";
import EditPetForm from "./Pages/EditPetForm";
import Success from "./Pages/Success";
import Cancel from "./Pages/Cancel";
import AppointmentPrfList from "./Pages/AppointmentPrfList";
import AppointmentForm from "./Component/AppointmentForm";
import UserEventsPage from "./Pages/UserEventsPage";
import UserEventDetailsPage from "./Pages/UserEventDetails";
import UserRegisteredEventsPage from "./Pages/UserRegisteredEventsPage";
import Notifications from "./Pages/Notifications";
import PetRegisterUserDashboard from "./Pages/PetRegisterUserDashboard";
import EditAdoptionForm from "./Pages/EditAdoptionForm";
import AppointmentManagerLayout from "./Component/AppointmentManagerLayout";
import Appointment_dashboard from "./Pages/Appointment_dashboard";
import Appointment_report from "./Pages/Appointment_report";
import App_history_page from "./Pages/Appoinment_for_history";
import Appointment_for_vet from "./Pages/Appointment_for_vet";
import Appointment_for_groomer from "./Pages/Appointment_for_groomer";
import Appointment_for_trainer from "./Pages/Appointment_for_trainer";
import Availability_for_vet from "./Pages/AvailabilityVetTable";
import Availability_for_groomer from "./Pages/AvailabilityGroomerTable";
import Availability_for_trainer from "./Pages/AvailabilityTrainerTable";
import CancelationReq from "./Pages/CancelationReqPage";
import ActiveProfessionals from "./Pages/ActiveProfessionals";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import PetAdoptionCoordinatorDashboard from "./Pages/AdoptionCoordinatorDashBoard";
import AdoptionScheduler from "./Pages/HomeVisitScheduler";
import PetLostandfound from "./Pages/PetLostandfound";
import AddLostPet from "./Pages/AddLostPet";
import AddFoundPet from "./Pages/AddFoundPet";
import PetDetails from './Pages/PetDetails';
import EditLostPet from './Pages/EditLostPet';
import EditFoundPet from './Pages/EditFoundPet';
import MyPetReports from './Pages/MyPetReports';

import Collection from "./Pages/Collection";
import Product from "./Pages/Product";
import Cart from "./Pages/Cart";
import PlaceOrder from "./Pages/PlaceOrder";
import Orders from "./Pages/Orders";
import StoreAdminDashboard from "./Pages/StoreAdminDashboard";
import StoreStripeVerify from "./Pages/storeStripeVerify";
import PetStoreReview from "./Pages/PetStoreReview";
import ShopContextProvider from './context/ShopContext.jsx'
//event admin 
import MyEvents from './Pages/EventMyEvents';
import EventDetails from './Pages/EventEventDetails';
import EditEvent from './Pages/EventEditEvent';
import Notification from './Pages/EventNotification';
import Dashboard from './Pages/EventDashboard';
import CreateEvent from './Pages/EventCreateEvent';
import EventManagerLayout from "./Component/EventManagerLayout";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Layout for pet owner routes with UserHeader and UserFooter
const MainLayout = ({ children }) => {
  return (
    <>
      <UserHeader />
      {children}
      <UserFooter />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
    <ShopContextProvider>
      {/* Toast Container for notifications */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={true} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <Routes>
        {/* Public Routes with MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <PetPlatformHomePage />
            </MainLayout>
          }
        />

        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/signup" element={<MainLayout><Signup /></MainLayout>} />

        <Route
          path="/stafflogin"
          element={
            <MainLayout>
              <StaffLogin />
            </MainLayout>
          }
        />
        <Route
          path="/AdminRegister"
          element={
            
              <AdminRegister />
            
          }
        />
        <Route
          path="/aboutus"
          element={
            <MainLayout>
              <AboutUs />
            </MainLayout>
          }
        />
        <Route
          path="/UserEdit"
          element={
            <MainLayout>
              <UserEdit />
            </MainLayout>
          }
        />
        <Route
          path="/UsersList"
          element={
            
              <UsersList />
            
          }
        />
        <Route
          path="/contactus"
          element={
            <MainLayout>
              <ContactUs />
            </MainLayout>
          }
        />
        <Route
          path="/PetRegister"
          element={
            <MainLayout>
              <PetRegister />
            </MainLayout>
          }
        />
        <Route
          path="/ViewPetProfile/:id"
          element={
            <MainLayout>
              <PetEdit />
            </MainLayout>
          }
        />
        <Route path="/PetEdit/:id" element={<PetEdit />} />
        <Route path="/admin/professionals/edit/:id" element={<ProfessionalEdit />} />
        <Route
          path="/ProfessionalRegistration"
          element={
            
              <ProfessionalRegistration />
            
          }
        />
        <Route
          path="/ProfessionalsList"
          element={
            
              <ProfessionalsList />
            
          }
        />
        <Route
          path="/events"
          element={
            <MainLayout>
              <UserEventsPage />
            </MainLayout>
          }
        />
        <Route
          path="/appointment"
          element={
            <MainLayout>
              <AppointmentPrfList />
            </MainLayout>
          }
        />
        <Route
          path="/adoption"
          element={
            <MainLayout>
              <AdoptionHomePage />
            </MainLayout>
          }
        />
        <Route
          path="/info_adoptable_pet"
          element={
            <MainLayout>
              <AdoptablePetList />
            </MainLayout>
          }
        />
        <Route
          path="/add_adoptable_pet"
          element={
            <MainLayout>
              <AddForAdoption />
            </MainLayout>
          }
        />
        <Route
          path="/info_select_pet"
          element={
            <MainLayout>
              <AdoptionHomePage />
            </MainLayout>
          }
        />
        <Route
          path="/adopt"
          element={
            <MainLayout>
              <AdoptionForm />
            </MainLayout>
          }
        />
        <Route
          path="/Submit_adoption_Form"
          element={
            <MainLayout>
              <AdoptionHomePage />
            </MainLayout>
          }
        />

          {/* Adoption Manager Routes */}
          <Route 
            path="/AdoptionCoordinatorDashboard" 
            element={
              <MainLayout>
                <PetAdoptionCoordinatorDashboard />
              </MainLayout>} />

          <Route path="/schedule-visit" element={<AdoptionScheduler />} />

        {/* Admin Dashboard Routes */}
        <Route
          path="/admin/redirect/user_admin"
          element={
            <PrivateRoute>
              
                <SysAdminDashboard />
              
            </PrivateRoute>
          }
        />

        {/* Store Manager Routes */}
        <Route
          path="/admin/redirect/store_manager"
          element={
            <PrivateRoute>
              <StoreAdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/store-admin/*"
          element={
            <PrivateRoute>
              <StoreAdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Appointment Manager Routes with AppointmentManagerLayout */}
        <Route
          path="/admin/redirect/appointment_manager"
          element={
            <PrivateRoute>
              <AppointmentManagerLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Appointment_dashboard />} />
          <Route path="dashboard" element={<Appointment_dashboard />} />
          <Route path="reports" element={<Appointment_report />} />
          <Route path="appointments/history" element={<App_history_page />} />
          <Route path="appointments/vet" element={<Appointment_for_vet />} />
          <Route path="appointments/grooming" element={<Appointment_for_groomer />} />
          <Route path="appointments/training" element={<Appointment_for_trainer />} />
          <Route path="professionals/active" element={<ActiveProfessionals />} />
          <Route path="availability/vet" element={<Availability_for_vet />} />
          <Route path="availability/groomer" element={<Availability_for_groomer />} />
          <Route path="availability/trainer" element={<Availability_for_trainer />} />
          <Route path="refund-request" element={<CancelationReq />} />
        </Route>


        
        {/* Event Manager Routes with EventManagerLayout */}
        <Route
          path="/admin/redirect/event_manager"
          element={
            <PrivateRoute>
              <EventManagerLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create" element={<CreateEvent />} />
          <Route path="events" element={<MyEvents />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="edit/:id" element={<EditEvent />} />
          <Route path="analytics" element={<Notification />} />
          <Route path="profile" element={<Dashboard />} />
        </Route>







          <Route path="/verify" element={<StoreStripeVerify />} />
          <Route path="/storeStripeVerify" element={<StoreStripeVerify />} />

        {/* Adoption Manager Routes */}
        <Route
          path="/admin/redirect/adoption_manager"
          element={
            <PrivateRoute>
              <PetAdoptionCoordinatorDashboard />
            </PrivateRoute>
          }
        />

        {/* Protected Routes with MainLayout */}
        <Route
          path="/event/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <UserEventDetailsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-events"
          element={
            <PrivateRoute>
              <MainLayout>
                <UserRegisteredEventsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <MainLayout>
                <Notifications />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/appointment-form"
          element={
            <PrivateRoute>
              <MainLayout>
                <AppointmentForm />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/success"
          element={
            <PrivateRoute>
              <MainLayout>
                <Success />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cancel"
          element={
            <PrivateRoute>
              <MainLayout>
                <Cancel />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/pet-owner-dashboard"
          element={
            <PrivateRoute>
              <MainLayout>
                <PetOwnerDashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/pet-register-dashboard"
          element={
            <PrivateRoute>
              <MainLayout>
                <PetRegisterUserDashboard />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-adoption-form/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <EditAdoptionForm />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-pet/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <EditPetForm />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/pet-lost-and-found"
          element={
            <MainLayout>
              <PetLostandfound />
            </MainLayout>
          }
        />
        <Route
          path="/add-lost-pet"
          element={
            <PrivateRoute>
              <MainLayout>
                <AddLostPet />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/add-found-pet"
          element={
            <PrivateRoute>
              <MainLayout>
                <AddFoundPet />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/pet-details/:id"
          element={
            <MainLayout>
              <PetDetails />
            </MainLayout>
          }
        />
        <Route path="/edit-lost-pet/:id" element={<MainLayout><EditLostPet /></MainLayout>} />
        <Route path="/edit-found-pet/:id" element={<MainLayout><EditFoundPet /></MainLayout>} />
        <Route path="/my-pet-reports" element={<MainLayout><MyPetReports /></MainLayout>} />

        {/* Marketplace */}
           <Route
          path="/collection"
          element={
            <MainLayout>
              <Collection />
            </MainLayout>
          }
        />

          <Route
          path="/product/:ProductId"
          element={
            <MainLayout>
              <Product />
            </MainLayout>
          }
        />
        <Route
          path="/cart"
          element={
            <MainLayout>
              <Cart/>
            </MainLayout>
          }
        />
        <Route
          path="/placeOrder"
          element={
            <MainLayout>
              <PlaceOrder/>
            </MainLayout>
          }
        />
          <Route
          path="/orders"
          element={
            <MainLayout>
              <Orders/>
            </MainLayout>
          }
        />
        <Route
          path="/petStoreReview/:productId"
          element={
            <PrivateRoute>
              <MainLayout>
                <PetStoreReview />
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
      </ShopContextProvider>
    </BrowserRouter>
  );
};

export default App;