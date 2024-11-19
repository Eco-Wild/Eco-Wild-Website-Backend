import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
  source: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  tags: { type: [String], default: [] },
});

export default mongoose.model("Media", MediaSchema);