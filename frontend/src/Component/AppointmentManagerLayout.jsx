import { Outlet } from "react-router-dom";
import AppointmentManagerSidebar from "./AppointmentManagerHeader"; // Assuming this is the correct path

const AppointmentManagerLayout = () => {
  return (
    <div className="flex">
      <AppointmentManagerSidebar />
      <div className="flex-1 lg:ml-64 pt-4 w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default AppointmentManagerLayout;