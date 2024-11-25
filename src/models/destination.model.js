import mongoose from "mongoose";

const DestinationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], default: [] },
  publish_date: { type: Date },
  location: { type: String },
  comments: { type: [mongoose.Types.ObjectId], ref: "Comment" },
  tags: { type: [String], default: [] },
  bookmark: { type: Boolean, default: false },
});

export default mongoose.model("Destination", DestinationSchema);
