import { useState } from "react";

export default function EventForm({ event, onSave }) {
  const [eventData, setEventData] = useState({
    title: event?.title || "",
    date: event?.date ? new Date(event.date).toISOString().split("T")[0] : "",
    time: event?.time || "",
    location: event?.location || "",
    description: event?.description || "",
    maxAttendees: event?.maxAttendees || "",
    price: event?.price || "",
    eventImage: null,
    previewImage: event?.eventImageURL || "",
  });

  const [errors, setErrors] = useState({});
  const today = "2025-05-15"; // Fixed to May 15, 2025, per provided date

  const validateField = (name, value) => {
    switch (name) {
      case "title":
        return value.trim() ? "" : "Event title is required";
      case "date":
        if (!value) return "Event date is required";
        const inputDate = new Date(value);
        const todayDate = new Date(today);
        if (isNaN(inputDate.getTime())) return "Invalid date format";
        if (inputDate < todayDate) return "Date must be today or in the future";
        return "";
      case "time":
        if (!value) return "Event time is required";
        if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
          return "Time must be in 24-hour format (e.g., 14:00)";
        }
        return "";
      case "location":
        return value.trim() ? "" : "Location is required";
      case "description":
        return value.trim() ? "" : "Description is required";
      case "maxAttendees":
        if (!value) return "Maximum attendees is required";
        if (isNaN(value) || value <= 0) return "Must be a positive number";
        if (!Number.isInteger(Number(value))) return "Must be an integer";
        return "";
      case "price":
        if (value === "") return "Price is required";
        if (isNaN(value) || value < 0) return "Price must be non-negative";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(eventData).forEach((key) => {
      if (key !== "eventImage" && key !== "previewImage") {
        const error = validateField(key, eventData[key]);
        if (error) newErrors[key] = error;
      }
    });

    // File validation (only if a new file is selected)
    if (eventData.eventImage) {
      const file = eventData.eventImage;
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        newErrors.eventImage = "Only JPEG and PNG images are allowed";
      } else if (file.size > 5 * 1024 * 1024) {
        newErrors.eventImage = "Image size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, value),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileError = validateField("eventImage", file);
      if (fileError) {
        setErrors((prevErrors) => ({ ...prevErrors, eventImage: fileError }));
        return;
      }
      setEventData((prevData) => ({
        ...prevData,
        eventImage: file,
        previewImage: URL.createObjectURL(file),
      }));
      setErrors((prevErrors) => ({ ...prevErrors, eventImage: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(eventData);
    }
  };

  const isFormValid = () => {
    return (
      Object.keys(errors).every((key) => !errors[key]) &&
      Object.keys(eventData)
        .filter((key) => key !== "eventImage" && key !== "previewImage")
        .every((key) => eventData[key].toString().trim() !== "")
    );
  };

  return (
    <section className="bg-gradient-to-br from-[#FFF5E6] to-[#F5EFEA] min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <div className="bg-white/80 rounded-2xl shadow-lg p-8 border border-amber-100">
          <div className="bg-gradient-to-r from-[#D08860] to-[#B3704D] py-6 px-8 rounded-t-xl mb-6">
            <h2 className="text-3xl font-bold text-white text-center">
              {event?._id ? "Edit Your Event" : "Create New Event"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={eventData.title}
                  onChange={handleChange}
                  required
                  placeholder="Enter event title"
                  className={`w-full px-4 py-3 border ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>
              <div className="relative">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  min={today}
                  required
                  className={`w-full px-4 py-3 border ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="text"
                  name="time"
                  value={eventData.time}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 14:00"
                  className={`w-full px-4 py-3 border ${
                    errors.time ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base`}
                />
                {errors.time && (
                  <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                )}
              </div>
              <div className="relative">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={eventData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter event location"
                  className={`w-full px-4 py-3 border ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base`}
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Maximum Attendees
                </label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={eventData.maxAttendees}
                  onChange={handleChange}
                  required
                  min="1"
                  step="1"
                  placeholder="Enter max attendees"
                  className={`w-full px-4 py-3 border ${
                    errors.maxAttendees ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base`}
                />
                {errors.maxAttendees && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxAttendees}</p>
                )}
              </div>
              <div className="relative">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={eventData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                  className={`w-full px-4 py-3 border ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base`}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Event Description
              </label>
              <textarea
                name="description"
                value={eventData.description}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Describe your event"
                className={`w-full px-4 py-3 border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Event Image (JPEG/PNG, max 5MB)
              </label>
              <input
                type="file"
                name="eventImage"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className={`w-full px-4 py-3 border ${
                  errors.eventImage ? "border-red-500" : "border-gray-300"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D08860] focus:border-transparent text-base`}
              />
              {errors.eventImage && (
                <p className="text-red-500 text-sm mt-1">{errors.eventImage}</p>
              )}
              {eventData.previewImage && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={eventData.previewImage}
                    alt="Event Preview"
                    className="max-w-md max-h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormValid()}
                className={`w-full px-6 py-3 rounded-xl text-base font-medium text-white transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D08860] ${
                  isFormValid()
                    ? "bg-gradient-to-r from-[#D08860] to-[#B3704D] hover:bg-[#80533b]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {event?._id ? "Update Event" : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}