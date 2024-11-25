import express from "express";
import { 
  createDestination, 
  fetchDestinations, 
  getDestinationWithComments, 
  deleteDestination, 
  updateDestination, 
  addComment, 
  deleteComment, 
  getDestinationCount, 
  bookmarkDestination,
  upload
} from "./destination.controller.js";
import { accessAuth } from "../../middleware/auth.js";
const router = express.Router();

// Create a new destination
router.post("/", [accessAuth, upload.fields([
  { name: "images", maxCount: 10 }, // Array of images
])],createDestination);

// Get all destinations with optional filters
router.get("/", fetchDestinations);

// Get the total number of destinations
router.get("/count", getDestinationCount);
// Get a specific destination with comments
router.get("/:id", getDestinationWithComments);

// Delete a destination by ID
router.delete("/:id",accessAuth, deleteDestination);

// Update a destination by ID
router.put("/:id",[accessAuth, upload.fields([
  { name: "images", maxCount: 10 }, // Array of images
])], updateDestination);

// Add a comment to a destination
router.post("/:id/comment", addComment);

// Delete a comment from a destination
router.delete("/:id/comment/:commentId",accessAuth, deleteComment);


// Bookmark a destination
router.post("/:id/bookmark",accessAuth, bookmarkDestination);

export default router;
