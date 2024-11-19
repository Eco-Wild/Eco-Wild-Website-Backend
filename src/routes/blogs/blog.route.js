import express from "express";
import {
  createBlog,
  fetchBlogs,
  getBlogWithMedia,
  deleteBlog,
  updateBlog,
  addComment,
  deleteComment,
  getBlogCount,
  bookmarkBlog,
  upload
} from "./blog.controller.js";
import { accessAuth } from "../../middleware/auth.js";

const router = express.Router();

// Routes
// Create a new blog
router.post("/",[accessAuth,upload.single("image")], createBlog);

// Fetch blogs with query-based filtering, sorting, and pagination
router.get("/", fetchBlogs);

// Get the total number of blogs
router.get("/count", getBlogCount);

// Get a specific blog with media included
router.get("/:id", getBlogWithMedia);

// Delete a blog by ID
router.delete("/:id",accessAuth, deleteBlog);

// Update a blog by ID
router.put("/:id",[accessAuth,upload.single("image")], updateBlog);

// Add a comment to a blog
router.post("/:id/comments", addComment);

// Delete a comment from a blog
router.delete("/:id/comments/:commentId",accessAuth, deleteComment);

// Bookmark a blog
router.post("/:id/bookmark",accessAuth, bookmarkBlog);

export default router;
