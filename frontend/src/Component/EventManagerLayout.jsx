import EventHeader from "./EventHeader";
import { Outlet } from "react-router-dom";

export default function EventManagerLayout() {
  return (
    <div className="flex">
      <EventHeader />
      <div className="lg:pl-64 flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}