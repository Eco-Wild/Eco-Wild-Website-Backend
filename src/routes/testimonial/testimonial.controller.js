import Testimonial from "../../models/testimonial.model.js";
import Comment from "../../models/comment.model.js";

// Add a testimonial
export const addTestimonial = async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    const savedTestimonial = await testimonial.save();
    res.status(201).json({ testimonialId: savedTestimonial.id, status: "Success" });
  } catch (error) {
    res.status(500).json({ status: "Failure", error: error.message });
  }
};

// Update a testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const testimonialId = req.params.id;
    const updatedTestimonial = await Testimonial.findByIdAndUpdate(testimonialId, req.body, { new: true });
    if (!updatedTestimonial) return res.status(404).json({ error: "Testimonial not found" });
    res.status(200).json(updatedTestimonial);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonialId = req.params.id;
    const deletedTestimonial = await Testimonial.findByIdAndDelete(testimonialId);
    if (!deletedTestimonial) return res.status(404).json({ error: "Testimonial not found" });
    res.status(200).json({ status: "Success", message: "Testimonial deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch all testimonials with comments populated
export const fetchAllTestimonials = async (req, res) => {
    try {
      const testimonials = await Testimonial.find().populate("comments");
      res.status(200).json(testimonials);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
