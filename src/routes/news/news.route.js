import express from "express";
import {
  createNews,
  fetchNews,
  getNewsWithMedia,
  updateNews,
  deleteNews,
  getNewsCount,
  bookmarkNews,
  upload
} from "./news.controller.js";
import { accessAuth } from "../../middleware/auth.js";
const router = express.Router();

// Routes
// Create a new news item
router.post("/",[accessAuth,upload.single("image")], createNews);

// Fetch news with query-based filtering, sorting, and pagination
router.get("/", fetchNews);
// Get the total number of news items
router.get("/count", getNewsCount);

// Get a specific news item with media included
router.get("/:id", getNewsWithMedia);

// Update a news item by ID
router.put("/:id",[accessAuth,upload.single("image")], updateNews);

// Delete a news item by ID
router.delete("/:id",accessAuth, deleteNews);


// Bookmark a news item
router.post("/:id/bookmark",accessAuth, bookmarkNews);

export default router;
