import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("petOwnerToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/notifications/user");
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        console.log("Fetched notifications:", response.data.notifications);
      } else {
        setError("Failed to load notifications");
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.response?.data?.message || "Error fetching notifications");
      if (err.response?.status === 401) {
        localStorage.removeItem("petOwnerToken");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(
          notifications.map((notif) =>
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await api.patch("/notifications/read-all");
      if (response.data.success) {
        setNotifications(
          notifications.map((notif) => ({ ...notif, read: true }))
        );
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Helper function to determine notification styles
  const getNotificationStyles = (notification) => {
    const content = notification.content.toLowerCase();
    if (notification.type === "user") {
      if (content.includes("refund") || content.includes("cancelled") || content.includes("cancellation")) {
        return {
          card: "bg-red-100 border-red-300",
          stripe: "bg-gradient-to-b from-red-500 to-red-700",
          text: "text-red-700",
        };
      }
      if (content.includes("updated") || content.includes("tickets") || content.includes("modified")) {
        return {
          card: "bg-blue-100 border-blue-300",
          stripe: "bg-gradient-to-b from-blue-500 to-blue-700",
          text: "text-blue-700",
        };
      }
    }
    // Default for admin notifications or other user notifications
    return {
      card: "bg-white border-gray-100",
      stripe: "bg-gradient-to-b from-[#D08860] to-[#B3704D]",
      text: "text-gray-800",
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-32 px-6 py-20 text-center bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D08860] mx-auto"></div>
        <p className="text-gray-600 mt-6 text-base font-medium">Loading your notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto mt-32 px-6 py-6 bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA]">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center">
            <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="ml-4 text-base text-red-700 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const adminNotifications = notifications.filter(notif => notif.type === "admin");
  const userNotifications = notifications.filter(notif => notif.type === "user");

  return (
    <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">Notifications</span>
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Stay updated with your event notifications, including admin updates and your actions.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          {(adminNotifications.some(notif => !notif.read) || userNotifications.some(notif => !notif.read)) && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-xl hover:bg-[#80533b] transition-colors shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
            >
              Mark All as Read
            </button>
          )}
          <Link
            to="/events"
            className="flex items-center px-6 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition-colors border border-amber-200 shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Browse Events
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white/80 rounded-2xl p-10 text-center shadow-lg border border-amber-100 transform transition hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-amber-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-base mb-6">You have no notifications at the moment.</p>
            <Link to="/events" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white rounded-xl hover:bg-[#80533b] transition-colors shadow-md hover:shadow-lg transform hover:scale-105 duration-300">
              Discover Events
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {adminNotifications.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-amber-900 mb-4 border-b border-amber-200 pb-2">Event Notifications</h2>
                {adminNotifications.map((notification) => {
                  const styles = getNotificationStyles(notification);
                  return (
                    <div
                      key={notification._id}
                      className={`${styles.card} rounded-2xl shadow-lg overflow-hidden border hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                    >
                      <div className="md:flex">
                        <div className={`${styles.stripe} md:flex-shrink-0 flex items-center justify-center w-20 h-20 md:h-auto`}>
                          <div className="text-center text-white">
                            <div className="text-2xl font-bold">
                              {new Date(notification.createdAt).getDate()}
                            </div>
                            <div className="text-xs uppercase">
                              {new Date(notification.createdAt).toLocaleString('default', { month: 'short' })}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 md:flex-1 flex justify-between items-center">
                          <div>
                            <h2 className={`text-lg font-semibold ${styles.text} mb-2`}>
                              {notification.eventId?.title || "Event"}
                            </h2>
                            <p className={`text-sm ${notification.read ? "text-gray-500" : "font-medium text-gray-600"}`}>
                              {notification.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="text-amber-700 hover:text-amber-800 text-xs font-medium"
                              >
                                Mark as Read
                              </button>
                            )}
                            <Link
                              to={`/event/${notification.eventId?._id || '#'}`}
                              className="flex items-center bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white px-2 py-1 rounded hover:bg-[#80533b] transition-colors text-xs font-medium"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" stripeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {userNotifications.length > 0 && (
              <div className="mt-8 space-y-6">
                <h2 className="text-xl font-semibold text-amber-900 mb-4 border-b border-amber-200 pb-2">My Actions (e.g., Refunds, Registrations)</h2>
                {userNotifications.map((notification) => {
                  const styles = getNotificationStyles(notification);
                  return (
                    <div
                      key={notification._id}
                      className={`${styles.card} rounded-2xl shadow-lg overflow-hidden border hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                    >
                      <div className="md:flex">
                        <div className={`${styles.stripe} md:flex-shrink-0 flex items-center justify-center w-20 h-20 md:h-auto`}>
                          <div className="text-center text-white">
                            <div className="text-2xl font-bold">
                              {new Date(notification.createdAt).getDate()}
                            </div>
                            <div className="text-xs uppercaseding-2">
                              {new Date(notification.createdAt).toLocaleString('default', { month: 'short' })}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 md:flex-1 flex justify-between items-center">
                          <div>
                            <h2 className={`text-lg font-semibold ${styles.text} mb-2`}>
                              {notification.eventId?.title || "Event"}
                            </h2>
                            <p className={`text-sm ${notification.read ? "text-gray-500" : "font-medium text-gray-600"}`}>
                              {notification.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification._id)}
                                className="text-amber-700 hover:text-amber-800 text-xs font-medium"
                              >
                                Mark as Read
                              </button>
                            )}
                            <Link
                              to={`/event/${notification.eventId?._id || '#'}`}
                              className="flex items-center bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white px-2 py-1 rounded hover:bg-[#80533b] transition-colors text-xs font-medium"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542-7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;