import express from "express";
import {
  createEvent,
  fetchEvents,
  getEventWithMedia,
  updateEvent,
  deleteEvent,
  getEventCount,
  bookmarkEvent,
  upload
} from "./events.controller.js";
import { accessAuth } from "../../middleware/auth.js";
const router = express.Router();

// Routes
// Create a new event
router.post("/",[accessAuth,upload.single("image")], createEvent);

// Fetch events with query-based filtering, sorting, and pagination
router.get("/", fetchEvents);

// Get the total number of events
router.get("/count", getEventCount);

// Get a specific event with media included
router.get("/:id", getEventWithMedia);

// Update an event by ID
router.put("/:id",[accessAuth,upload.single("image")], updateEvent);

// Delete an event by ID
router.delete("/:id",accessAuth, deleteEvent);


// Bookmark an event
router.post("/:id/bookmark",accessAuth, bookmarkEvent);

export default router;
