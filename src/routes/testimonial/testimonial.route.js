import express from "express";
import { 
  addTestimonial, 
  updateTestimonial, 
  deleteTestimonial, 
  fetchAllTestimonials 
} from "./testimonial.controller.js";
import { accessAuth } from "../../middleware/auth.js";
const router = express.Router();

// Add a new testimonial
router.post("/", accessAuth,addTestimonial);

// Update a testimonial by ID
router.put("/:id",accessAuth, updateTestimonial);

// Delete a testimonial by ID
router.delete("/:id",accessAuth, deleteTestimonial);

// Fetch a testimonial by ID
router.get("/", fetchAllTestimonials);

export default router;
