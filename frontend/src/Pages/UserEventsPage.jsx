'use client'
//ui updated in branch 
import { useEffect, useState } from "react";
import UserEventCard from "../Component/UserEventCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCalendar, FaFilter, FaPaw, FaBell } from "react-icons/fa";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("petOwnerToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UserEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNotifications, setHasNotifications] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("petOwnerToken");

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/events/");
        const fetchedEvents = response.data;
        if (!Array.isArray(fetchedEvents)) {
          throw new Error("Invalid response format from server");
        }
        const activeEvents = fetchedEvents.filter(event => event.status.toLowerCase() === "active");
        setEvents(activeEvents);
        setFilteredEvents(activeEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error.response?.data?.message || "Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    if (token) {
      const fetchNotifications = async () => {
        try {
          const response = await api.get("/notifications/user");
          if (response.data.success) {
            const notifications = response.data.notifications;
            const unread = notifications.filter(notif => !notif.read).length;
            setUnreadCount(unread);
            setHasNotifications(notifications.length > 0);
          }
        } catch (err) {
          console.error("Error fetching notifications:", err);
          if (err.response?.status === 401) {
            localStorage.removeItem("petOwnerToken");
            navigate("/login");
          }
        }
      };
      fetchNotifications();
    } else {
      setUnreadCount(0);
      setHasNotifications(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    if (searchTerm) {
      const results = events.filter((event) =>
        (event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         event.location?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredEvents(results);
    } else {
      setFilteredEvents(events);
    }
  }, [searchTerm, events]);

  const handleViewRegisteredEvents = () => {
    if (token) {
      navigate("/my-events");
    } else {
      navigate("/login", { state: { from: { pathname: "/my-events" } } });
    }
  };

  const handleViewNotifications = () => {
    if (token) {
      navigate("/notifications");
    } else {
      navigate("/login", { state: { from: { pathname: "/notifications" } } });
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">Pet Events</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our community events and connect with fellow pet lovers. Find workshops, adoption drives, and fun gatherings for you and your furry friends.
          </p>
          <div className="relative max-w-md mx-auto mt-6">
            <FaSearch className="absolute left-4 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-12 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent shadow-sm hover:shadow-md transition-all duration-300"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button
            className="bg-[#D08860] text-white px-6 py-3 rounded-xl hover:bg-[#80533b] transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <FaPaw size={20} />
            All Events
          </button>
          
          <button
            onClick={handleViewRegisteredEvents}
            disabled={!token}
            className={`px-6 py-3 rounded-xl text-white flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${
              token ? "bg-[#D08860] hover:bg-[#80533b]" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <FaCalendar size={20} />
            My Registered Events
          </button>
          <button
            onClick={handleViewNotifications}
            disabled={!token}
            className={`px-6 py-3 rounded-xl text-white flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative ${
              token ? "bg-[#D08860] hover:bg-[#80533b]" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <FaBell size={20} />
            My Notifications
            {token && unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
            {token && unreadCount === 0 && hasNotifications && (
              <span className="absolute -top-2 -right-2 bg-red-500 rounded-full h-3 w-3 animate-pulse"></span>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl shadow-lg mb-6">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Events Section */}
        <div className="relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">
              {searchTerm ? "Search Results" : "All Events"}
            </h3>
            <span className="bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white px-4 py-1 rounded-xl text-sm font-medium shadow-sm">
              {filteredEvents.length} {filteredEvents.length === 1 ? "Event" : "Events"} {searchTerm && "Found"}
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D08860]"></div>
            </div>
          ) : (
            <>
              {filteredEvents.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredEvents.map((event) => (
                    <UserEventCard key={event._id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="bg-white/80 p-8 rounded-2xl shadow-lg text-center transform transition hover:scale-105">
                  <img
                    src="/empty-events.svg"
                    alt="No events"
                    className="w-40 h-40 mx-auto mb-4 opacity-60"
                  />
                  <p className="text-lg text-gray-600">
                    {searchTerm ? "No events match your search criteria" : "No events available at the moment."}
                  </p>
                  <p className="text-gray-500 mt-2">
                    {searchTerm ? "Try using different keywords" : "Check back soon for upcoming pet events!"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEventsPage;