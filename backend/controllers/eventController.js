import Event from "../models/Event.js";
import cloudinary from "../config/cloudinary.js";

// Create Event
export const createEvent = async (req, res) => {
  try {
    let eventImageURL = "";
    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${base64Image}`,
        {
          folder: "events",
          resource_type: "image",
        }
      );
      if (!result || !result.secure_url) {
        throw new Error("Failed to get Cloudinary URL");
      }
      eventImageURL = result.secure_url;
    }

    const eventData = {
      ...req.body,
      eventImageURL,
      date: new Date(req.body.date),
    };

    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error("Create event error:", error);
    res.status(400).json({ message: error.message || "Failed to create event" });
  }
};

// Update Event
export const updateEvent = async (req, res) => {
  try {
    let eventImageURL;
    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${base64Image}`,
        {
          folder: "events",
          resource_type: "image",
        }
      );
      if (!result || !result.secure_url) {
        throw new Error("Failed to get Cloudinary URL");
      }
      eventImageURL = result.secure_url;
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const eventData = {
      ...req.body,
      ...(eventImageURL && { eventImageURL }),
      date: new Date(req.body.date),
    };

    if (eventData.maxAttendees < event.registeredTickets) {
      return res.status(400).json({ message: "Max attendees cannot be less than registered tickets" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, eventData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Update event error:", error);
    res.status(400).json({ message: error.message || "Failed to update event" });
  }
};

// Get All Events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json(events);
  } catch (error) {
    console.error("Get events error:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

// Get Single Event
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Get event error:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Delete event error:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};