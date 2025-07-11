import React from "react";
import EventForm from "../Component/EventForm";
import Footer from "../Component/EventFooter";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const CreateEvent = () => {
  const navigate = useNavigate();

  const handleSave = async (eventData) => {
    try {
      // Create FormData for multipart/form-data request
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

      // Send POST request to backend
      const response = await axios.post("http://localhost:5000/api/events", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Event created successfully!");
      navigate("/admin/redirect/event_manager/events");
    } catch (error) {
      console.error("Event creation error:", error);
      alert(error.response?.data?.message || error.message || "Failed to create event. Please try again.");
    }
  };

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
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create a New <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">Event</span>
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Set up a new event for pet owners to attend. Fill in the details below to get started.
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-8 flex-wrap">
            <Link
              to="/admin/redirect/event_manager/events"
              className="flex items-center px-6 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition-colors border border-amber-200 shadow-md hover:shadow-lg transform hover:scale-105 duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Events
            </Link>
          </div>

          {/* Additional Info Section */}
          <div className="bg-amber-50 rounded-2xl shadow-lg p-6 mb-8 border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-900 mb-4">How to Fill Out the Event Form</h2>
            <ul className="list-disc list-inside space-y-2 text-base text-gray-700">
              <li>
                <span className="font-medium">Event Title:</span> Choose a descriptive title (e.g., "Pet Adoption Day 2025").
              </li>
              <li>
                <span className="font-medium">Date:</span> Select a date on or after May 14, 2025 (today). Use the format YYYY-MM-DD.
              </li>
              <li>
                <span className="font-medium">Time:</span> Enter the start time in 24-hour format (e.g., 14:00 for 2:00 PM).
              </li>
              <li>
                <span className="font-medium">Location:</span> Provide a specific address or venue name (e.g., "Central Park, New York").
              </li>
              <li>
                <span className="font-medium">Price:</span> Enter the price per ticket in dollars (e.g., 10.00). Must be a positive number.
              </li>
              <li>
                <span className="font-medium">Max Attendees:</span> Set the maximum number of attendees (e.g., 50). Must be a positive integer.
              </li>
              <li>
                <span className="font-medium">Description:</span> Describe the event in detail, including activities and requirements.
              </li>
              <li>
                <span className="font-medium">Event Image:</span> Upload an image (optional). Supported formats: JPG, PNG. Max size: 5MB.
              </li>
            </ul>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-amber-100">
            <EventForm onSave={handleSave} />
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default CreateEvent;