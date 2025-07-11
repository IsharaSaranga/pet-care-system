import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Footer from "../Component/EventFooter";
import axios from "axios";
import EventDetailsHeader from "../Component/EventDetailsHeader";
import AttendeeList from "../Component/EventAttendeeList";
import SendNotification from "../Component/EventSendNotification";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendeesLoading, setAttendeesLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const eventResponse = await axios.get(`http://localhost:5000/api/events/${id}`);
        setEvent(eventResponse.data);

        try {
          const attendeesResponse = await axios.get(`http://localhost:5000/api/registrations/event/${id}`);
          setAttendees(attendeesResponse.data.registrations || []);
        } catch (attendeesError) {
          console.error("Error fetching attendees:", attendeesError);
          setAttendees([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load event data");
        console.error("Error fetching event data:", err);
      } finally {
        setLoading(false);
        setAttendeesLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const refreshAttendees = async () => {
    try {
      setAttendeesLoading(true);
      const response = await axios.get(`http://localhost:5000/api/registrations/event/${id}`);
      setAttendees(response.data.registrations || []);
    } catch (err) {
      console.error("Error refreshing attendees:", err);
    } finally {
      setAttendeesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen flex flex-col pt-32 pb-20">
        <div className="max-w-5xl w-full mx-auto p-8 bg-white/80 rounded-2xl shadow-lg border border-amber-100">
          <p className="text-center text-gray-600 text-base">Loading event data...</p>
        </div>
        <div className="relative z-10 mt-12">
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen flex flex-col pt-32 pb-20">
        <div className="max-w-5xl w-full mx-auto p-8 bg-white/80 rounded-2xl shadow-lg border border-amber-100">
          <p className="text-center text-red-500 text-base font-medium">{error}</p>
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
        <div className="max-w-5xl w-full mx-auto p-8 bg-white/80 rounded-2xl shadow-lg border border-amber-100">
          <p className="text-center text-red-500 text-base font-medium">Event not found!</p>
        </div>
        <div className="relative z-10 mt-12">
          <Footer />
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const today = new Date("2025-05-14T22:52:00+05:30");
  const isPastEvent = eventDate < today;
  const eventStatus = isPastEvent ? "Past" : "Upcoming";
  const ticketStats = {
    registered: event.registeredTickets || 0,
    max: event.maxAttendees || 0,
    percentage: event.maxAttendees > 0 ? ((event.registeredTickets || 0) / event.maxAttendees) * 100 : 0,
  };
  const activeRegistrations = attendees.filter(attendee => attendee.status?.toLowerCase() === "active").length;
  const canceledRegistrations = attendees.filter(attendee => attendee.status?.toLowerCase() === "cancelled").length;

  return (
    <div className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen flex flex-col pt-32 pb-20">
      <div className="max-w-5xl w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">Details</span>
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

        {/* Enhanced Event Overview Section */}
        <div className="bg-white/90 rounded-2xl shadow-xl p-8 border border-amber-100 mb-8 transition-all duration-300 hover:shadow-2xl">
          <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-[#D08860] to-[#B3704D] rounded-t-xl p-4 -m-8 mb-6">
            Event Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className="bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${isPastEvent ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {eventStatus}
              </span>
            </div>
            {/* Tickets Sold Card */}
            <div className="bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <p className="text-sm font-medium text-gray-700 mb-1">Tickets Sold</p>
              <p className="text-lg font-semibold text-gray-800">
                {ticketStats.registered} / {ticketStats.max}
                <span className="text-sm font-normal text-gray-600 ml-1">({ticketStats.percentage.toFixed(1)}% filled)</span>
              </p>
            </div>
            {/* Total Revenue Card */}
            <div className="bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <p className="text-sm font-medium text-gray-700 mb-1">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-800">${(ticketStats.registered * (event.price || 0)).toFixed(2)}</p>
            </div>
            {/* Active Registrations Card */}
            <div className="bg-green-50 p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <p className="text-sm font-medium text-green-800 mb-1">Active Registrations</p>
              <p className="text-2xl font-bold text-green-800">{activeRegistrations}</p>
            </div>
            {/* Canceled Registrations Card */}
            <div className="bg-red-50 p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <p className="text-sm font-medium text-red-800 mb-1">Canceled Registrations</p>
              <p className="text-2xl font-bold text-red-800">{canceledRegistrations}</p>
            </div>
            {/* Created At Card */}
            <div className="bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <p className="text-sm font-medium text-gray-700 mb-1">Created At</p>
              <p className="text-lg font-semibold text-gray-800">{new Date(event.createdAt).toLocaleDateString()}</p>
            </div>
            {/* Pet Policy Card */}
            <div className="bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
              <p className="text-sm font-medium text-gray-700 mb-1">Pet Policy</p>
              <p className="text-lg font-semibold text-gray-800">Dogs & Cats (1 pet + 1-2 people per ticket)</p>
            </div>
          </div>
        </div>

        {/* Existing EventDetailsHeader */}
        <EventDetailsHeader event={event} />
        <AttendeeList
          attendees={attendees}
          onRefresh={refreshAttendees}
          eventId={id}
          loading={attendeesLoading}
        />
        <SendNotification attendees={attendees} eventId={id} />
      </div>
      <div className="relative z-10 mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default EventDetails;