import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  publish_date: { type: Date },
  author: { type: String },
  tags: { type: [String], default: [] },
  bookmark: { type: Boolean, default: false },
});

export default mongoose.model("News", NewsSchema);
