import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image: { type: String },
  publish_date: { type: Date },
  author: { type: String },
  comment: { type: mongoose.Types.ObjectId, ref: "Comment",required: false },
  tags: { type: [String], default: [] },
  bookmark: { type: Boolean, default: false },
});

export default mongoose.model("Blog", BlogSchema);
