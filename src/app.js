import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth from "./routes/user/user.route.js"
import blog from "./routes/blogs/blog.route.js"
import destination from "./routes/destination/destination.route.js"
import testimonial from "./routes/testimonial/testimonial.route.js"
import event from "./routes/events/events.route.js"
import news from "./routes/news/news.route.js"
import path from "path";
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/auth", auth);
app.use("/blogs", blog);
app.use("/destinations", destination);
app.use("/testimonials", testimonial);
app.use("/events", event);
app.use("/news", news);
// Middleware to serve static files (images)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

export default app;
