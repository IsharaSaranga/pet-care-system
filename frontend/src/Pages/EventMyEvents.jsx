import { useState, useEffect } from "react";
import EventCard from "../Component/EventCard";
import Footer from "../Component/EventFooter";
import axios from "axios";
import { Link } from "react-router-dom";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/events");
        setEvents(response.data);
        setFilteredEvents(response.data);
      } catch (error) {
        console.error("Error fetching events:", error);
        alert(error.response?.data?.message || "Failed to load events");
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEvents(events);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredEvents(
        events.filter(
          (event) =>
            event.title.toLowerCase().includes(query) ||
            event.location.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, events]);

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (confirmDelete) {
      try {
        await axios.delete(`http://localhost:5000/api/events/${eventId}`);
        setEvents(events.filter((event) => event._id !== eventId));
        alert("Event deleted successfully!");
      } catch (error) {
        console.error("Error deleting event:", error);
        alert(error.response?.data?.message || "Failed to delete event");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] pt-32 pb-20">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D08860] rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#D08860] rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="relative z-10 flex-grow container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">Events</span>
            </h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Manage your events here. Update, delete, or view notifications for each event.
            </p>
          </div>

          {/* Search Bar and Create Event Link */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:w-1/2">
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base pl-10"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Link
              to="/admin/redirect/event_manager/create"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-xl hover:bg-[#80533b] transition-colors shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Event
            </Link>
          </div>

          {/* Additional Info Section */}
          <div className="bg-amber-50 rounded-2xl shadow-lg p-6 mb-8 border border-amber-200">
            <h3 className="text-xl font-semibold text-amber-900 mb-4">
              Managing Your Events
            </h3>
            <ul className="list-disc list-inside space-y-2 text-base text-gray-700">
              <li>
                <span className="font-medium">Updating Events:</span> Click "Update" to edit event details like title, date, or price.
              </li>
              <li>
                <span className="font-medium">Deleting Events:</span> Use "Delete" to remove an event. This action is permanent.
              </li>
              <li>
                <span className="font-medium">Notifications:</span> Select "Notification" to view or send updates for an event.
              </li>
              <li>
                <span className="font-medium">Event Status:</span> Check the ticket count to see how many attendees have registered.
              </li>
              <li>
                <span className="font-medium">Past Events:</span> Events before May 14, 2025, are not editable but can be deleted.
              </li>
            </ul>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/80 rounded-2xl shadow-lg border border-amber-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-amber-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-base text-gray-600 mb-4">
                {searchQuery
                  ? "No events match your search."
                  : "You have not created any events yet."}
              </p>
              <Link
                to="/create-event"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-xl hover:bg-[#80533b] transition-colors shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
              >
                Create Your First Event
              </Link>
            </div>
          )}
        </div>
      </div>

     
    </div>
  );
};

export default MyEvents;