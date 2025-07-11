'use client'

import { FaClock, FaMapMarkerAlt, FaTicketAlt, FaUsers, FaCheckCircle, FaPaw } from "react-icons/fa";

const EventDetailsHeader = ({ event }) => {
  const formattedDate = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const maxAttendees = event.maxAttendees || 0;
  const registeredTickets = event.registeredTickets || 0;
  const ticketsRemaining = Math.max(0, maxAttendees - registeredTickets);

  return (
    <div className="bg-white/80 rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
      <div className="relative mb-10 pt-[50%]">
        <img
          src={event.eventImageURL || "/default-event.jpg"}
          alt={event.title}
          className="absolute top-0 left-0 w-full h-full object-cover rounded-xl transition-transform duration-300 hover:scale-105"
          onError={(e) => (e.target.src = "/default-event.jpg")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      <h2 className="text-4xl font-bold text-gray-900 mb-8">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D08860] to-[#B3704D]">
          {event.title}
        </span>
      </h2>

      {/* Pet Policy Highlight */}
      <div className="bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white p-6 rounded-xl shadow-lg mb-8 flex items-center gap-4 transform transition hover:scale-105">
        <FaPaw className="text-4xl" />
        <div>
          <h3 className="text-xl font-semibold">Dogs & Cats Welcome!</h3>
          <p className="text-sm mt-1">
            Each ticket is for <span className="font-bold">one pet</span> (dog or cat) and allows{" "}
            <span className="font-bold">1-2 people</span> to accompany.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-600 mb-10">
        <div className="flex items-center bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-sm transition-transform duration-300 hover:scale-105">
          <FaClock className="text-[#D08860] mr-4" size={24} />
          <div>
            <span className="text-base font-semibold text-[#B3704D]">
              {formattedDate} at {event.time}
            </span>
          </div>
        </div>
        <div className="flex items-center bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-sm transition-transform duration-300 hover:scale-105">
          <FaMapMarkerAlt className="text-[#D08860] mr-4" size={24} />
          <div>
            <span className="text-base font-semibold text-[#B3704D]">{event.location}</span>
          </div>
        </div>
        <div className="flex items-center bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-sm transition-transform duration-300 hover:scale-105">
          <FaTicketAlt className="text-[#D08860] mr-4" size={24} />
          <div>
            <span className="text-base font-semibold text-[#B3704D]">
              {event.price ? `$${event.price.toFixed(2)}` : "Free"} per ticket
            </span>
          </div>
        </div>
        <div className="flex items-center bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-sm transition-transform duration-300 hover:scale-105">
          <FaUsers className="text-[#D08860] mr-4" size={24} />
          <div>
            <span className="text-base font-semibold text-[#B3704D]">
              Max Participants: {maxAttendees}
            </span>
          </div>
        </div>
        <div className="flex items-center bg-gradient-to-r from-[#FFF5E6] to-[#F5EFEA] p-4 rounded-xl shadow-sm transition-transform duration-300 hover:scale-105">
          <FaCheckCircle className="text-[#D08860] mr-4" size={24} />
          <div>
            <span className="text-base font-semibold text-[#B3704D]">
              Tickets Remaining: {ticketsRemaining}
            </span>
          </div>
        </div>
      </div>

      <p className="text-gray-700 text-base leading-relaxed bg-white/50 p-6 rounded-xl shadow-sm">
        {event.description}
      </p>
    </div>
  );
};

export default EventDetailsHeader;