import React from "react";

const EventDetailsHeader = ({ event }) => {
  const formattedPrice = event.price.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

  const remainingTickets = event.maxAttendees - (event.registeredTickets || 0);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg">
      <div className="relative">
        <img
          src={event.eventImageURL || "https://via.placeholder.com/800x400"}
          alt={event.title}
          className="w-full h-96 object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
          <h2 className="text-4xl font-extrabold text-white drop-shadow-lg">{event.title}</h2>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#D08860]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-700">
              {new Date(event.date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#D08860]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-700">{event.time}</span>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#D08860]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-lg font-semibold text-gray-700">{event.location}</p>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#D08860]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.768-.231-1.47-.62-2.062M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.768.231-1.47.62-2.062M5.625 14H14"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-700">
              Max Attendees: {event.maxAttendees}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#D08860]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-700">
              Ticket Price: {formattedPrice}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#D08860]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-700">
              Active Registrations: {event.registeredTickets} / Remaining: {remainingTickets}
            </span>
          </div>
        </div>

        <p className="text-gray-800 text-base leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-[#D08860]">
          {event.description}
        </p>
      </div>
    </div>
  );
};

export default EventDetailsHeader;