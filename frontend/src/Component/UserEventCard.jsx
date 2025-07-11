'use client'

import { useNavigate } from "react-router-dom";
import { FaClock, FaMapMarkerAlt, FaArrowRight, FaTicketAlt } from "react-icons/fa";

const UserEventCard = ({ event }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/event/${event._id}`);
  };

  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isSoldOut = event.registeredTickets >= event.maxAttendees;

  const handleImageError = (e) => {
    e.target.src = "/default-event.jpg";
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white/80 shadow-lg flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-100 group transform">
      <div className="relative pt-[56.25%]">
        <img
          src={event.eventImageURL || "/default-event.jpg"}
          alt={event.title}
          className="absolute top-0 left-0 w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
          onClick={handleViewDetails}
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white px-3 py-1 rounded-xl text-sm font-semibold shadow-sm">
          {formattedDate}
        </div>
        {isSoldOut && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-xl text-sm font-semibold shadow-sm">
            Sold Out
          </div>
        )}
      </div>

      <div className="p-6 flex-grow flex flex-col">
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-[#B3704D] line-clamp-2">{event.title}</h3>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <FaClock className="text-gray-400 mr-2" size={14} />
            <span className="text-sm text-gray-600">{event.time}</span>
          </div>

          <div className="flex items-center">
            <FaMapMarkerAlt className="text-gray-400 mr-2" size={14} />
            <span className="text-sm text-gray-600">{event.location}</span>
          </div>

          <div className="flex items-center">
            <FaTicketAlt className="text-gray-400 mr-2" size={14} />
            <span className="text-sm font-medium text-gray-700">
              {event.price ? `$${event.price.toFixed(2)}` : "Free"} / ticket
              {event.maxAttendees && (
                <span className="ml-2 text-[#D08860]">
                  ({event.maxAttendees - event.registeredTickets} left)
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleViewDetails}
            disabled={isSoldOut}
            className={`w-full py-2.5 text-center font-medium rounded-xl transition-all flex items-center justify-center shadow-md hover:shadow-lg ${
              isSoldOut
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white hover:bg-[#80533b] transform hover:scale-105"
            }`}
          >
            {isSoldOut ? "Sold Out" : "View Details"}
            {!isSoldOut && <FaArrowRight className="ml-2" size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserEventCard;