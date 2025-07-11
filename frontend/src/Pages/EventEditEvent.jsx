import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import EventForm from "../Component/EventForm";
import Footer from "../Component/EventFooter";
import axios from "axios";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(response.data);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError(error.response?.data?.message || "Failed to load event");
        setTimeout(() => navigate("/admin/redirect/event_manager/events"), 3000);
      }
    };

    fetchEvent();
  }, [id, navigate]);

  const handleSave = async (eventData) => {
    try {
      const formData = new FormData();
      formData.append("title", eventData.title);
      formData.append("date", eventData.date);
      formData.append("time", eventData.time);
      formData.append("location", eventData.location);
      formData.append("description", eventData.description);
      formData.append("maxAttendees", eventData.maxAttendees);
      formData.append("price", eventData.price);
      if (eventData.eventImage) {
        formData.append("eventImage", eventData.eventImage);
      }

      await axios.put(`http://localhost:5000/api/events/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Event updated successfully!");
      navigate("/admin/redirect/event_manager/events");
    } catch (error) {
      console.error("Event update error:", error);
      alert(error.response?.data?.message || error.message || "Failed to update event. Please try again.");
    }
  };

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen flex flex-col pt-32 pb-20">
        <div className="max-w-4xl w-full mx-auto p-8 bg-white/80 rounded-2xl shadow-lg border border-amber-100">
          <p className="text-center text-red-500 text-base font-medium">{error}</p>
          <p className="text-center text-gray-600 text-base mt-2">
            Redirecting to My Events in 3 seconds...
          </p>
        </div>
        <div className="relative z-10 mt-12">
          <Footer />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen flex flex-col pt-32 pb-20">
        <div className="max-w-4xl w-full mx-auto p-8 bg-white/80 rounded-2xl shadow-lg border border-amber-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-700"></div>
            <p className="text-gray-600 text-base mt-4">Loading event details...</p>
          </div>
        </div>
        <div className="relative z-10 mt-12">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] pt-32 pb-20">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D08860] rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#D08860] rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex-grow container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">Event</span>
            </h1>
            <Link
              to="/admin/redirect/event_manager/events"
              className="flex items-center px-6 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition-colors border border-amber-200 shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Events
            </Link>
          </div>

          <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-amber-100">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>
              <p className="text-base text-gray-600">
                Last updated: {new Date(event.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <EventForm event={event} onSave={handleSave} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default EditEvent;