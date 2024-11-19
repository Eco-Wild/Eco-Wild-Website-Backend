import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  comments: { type: String, required: true },
  comment_date: { type: Date, default: Date.now },
});

export default mongoose.model("Comment", CommentSchema);
