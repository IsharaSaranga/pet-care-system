import { Link, useNavigate } from "react-router-dom";

const EventCard = ({ event, onDelete }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/admin/redirect/event_manager/events/${event._id}`);
  };

  const handleUpdate = () => {
    navigate(`/admin/redirect/event_manager/edit/${event._id}`);
  };

  const handleDelete = () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this event?");
    if (isConfirmed) {
      onDelete(event._id);
    }
  };

  return (
    <div className="relative bg-white/80 rounded-2xl shadow-lg overflow-hidden border border-amber-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[300px] min-h-[450px] flex flex-col">
      <div className="relative">
        <img
          src={event.eventImageURL || "https://via.placeholder.com/400x200"}
          alt={event.title}
          className="w-full h-52 object-cover cursor-pointer"
          onClick={handleViewDetails}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
        <div className="absolute top-4 right-4 bg-amber-50 text-amber-800 px-2 py-1 rounded-lg text-sm font-medium">
          {event.registeredTickets}/{event.maxAttendees} Tickets
        </div>
      </div>

      <div className="p-6 space-y-3 flex-grow">
        <h3 className="text-xl font-semibold text-gray-800 break-words">{event.title}</h3>
        <div className="text-gray-600 space-y-2 text-base">
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-[#D08860]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {new Date(event.date).toLocaleDateString()} • {event.time}
          </p>
          <p className="flex items-center break-words">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-[#D08860]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {event.location}
          </p>
          <p className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-[#D08860]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.104 0-2 .896-2 2s.896 2 2 2 2-.896 2-2-.896-2-2-2zm0-2c2.21 0 4 1.79 4 4s-1.79 4-4-4-4-1.79-4-4 1.79-4 4-4zM5 20h14v2H5v-2z"
              />
            </svg>
            Price: ${event.price}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0 flex justify-between items-center gap-2">
        <button
          onClick={handleUpdate}
          className="flex-1 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white px-4 py-2 rounded-xl hover:bg-[#80533b] transition-colors duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span>Update</span>
        </button>

        <button
          onClick={handleViewDetails}
          className="flex-1 bg-gradient-to-r from-[#D08860] to-[#B3704D] text-white px-4 py-2 rounded-xl hover:bg-[#80533b] transition-colors duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span>Notification</span>
        </button>

        <button
          onClick={handleDelete}
          className="flex-1 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default EventCard;