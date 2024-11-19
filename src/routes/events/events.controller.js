import Event from "../../models/event.model.js";
import fs from "fs";
import path from "path";
import multer from "multer";

// Multer setup (same as before)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      cb(null, true);
    } else {
      cb("Error: Images only (jpeg, jpg, png)!");
    }
  },
});

// Create an event with image upload
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, organizer } = req.body;
    const image = req.file ? req.file.path : null;

    const event = new Event({
      title,
      description,
      date,
      location,
      organizer,
      image,
    });

    const savedEvent = await event.save();
    res.status(201).json({ eventId: savedEvent._id, status: "Success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an event (with optional image update)
export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, description, date, location, organizer } = req.body;

    // Find the existing event
    const existingEvent = await Event.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Handle image update if a new image is uploaded
    let updatedImage = existingEvent.image;
    if (req.file) {
      // Delete the old image file if it exists
      if (existingEvent.image) {
        fs.unlink(existingEvent.image, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      updatedImage = req.file.path;
    }

    // Update the event details
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        title,
        description,
        date,
        location,
        organizer,
        image: updatedImage,
      },
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an event (and its associated image)
export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete the associated image file if it exists
    if (event.image) {
      fs.unlink(event.image, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    // Delete the event from the database
    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch events (with search, filter, sort, and pagination)
export const fetchEvents = async (req, res) => {
  try {
    const {
      title,
      startDate,
      endDate,
      sortBy = "publish_date",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build the query object
    const query = {};
    if (title) {
      query.title = { $regex: title, $options: "i" }; // Search events by title (case-insensitive)
    }
    if (startDate && endDate) {
      query.publish_date = { $gte: new Date(startDate), $lte: new Date(endDate) }; // Filter by date range
    }

    // Set pagination options
    const pageNumber = parseInt(page, 10);
    const pageLimit = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageLimit;

    // Sort options
    const sortOptions = {};
    if (sortBy) {
      sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Fetch events with the query, sort, and pagination
    const events = await Event.find(query).sort(sortOptions).skip(skip).limit(pageLimit);

    // Count total documents for the query
    const totalEvents = await Event.countDocuments(query);

    res.status(200).json({
      totalEvents,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalEvents / pageLimit),
      events,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific event with media included
export const getEventWithMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get the total number of events
export const getEventCount = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    res.status(200).json({ totalEvents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bookmark an event
export const bookmarkEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    event.bookmark = !event.bookmark;
    await event.save();
    res.status(200).json({ status: "Success", message: "Event bookmarked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


