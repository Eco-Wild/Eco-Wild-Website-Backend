import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  comments: { type: mongoose.Types.ObjectId, ref: "Comment" },
});

export default mongoose.model("Testimonial", TestimonialSchema);
