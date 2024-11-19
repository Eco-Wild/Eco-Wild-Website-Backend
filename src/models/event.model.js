import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  publish_date: { type: Date },
  author: { type: String },
  tags: { type: [String], default: [] },
  bookmark: { type: Boolean, default: false },
});

export default mongoose.model("Event", EventSchema);
