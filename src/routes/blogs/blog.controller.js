import Blog from "../../models/blog.model.js";
import Comment from "../../models/comment.model.js";
import path from "path";
import fs from "fs";

// Multer setup for image upload
import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where images are stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique file name
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      cb(null, true);
    } else {
      cb("Error: Images only (jpeg, jpg, png)!");
    }
  },
});

// Create a blog with image upload
export const createBlog = async (req, res) => {
  try {
    const { title, content, author, publish_date, tags } = req.body;
    const image = req.file ? req.file.filename : null;

    const blog = new Blog({
      title,
      content,
      author,
      publish_date,
      tags: tags ? tags.split(",") : [],
      image,
    });

    const savedBlog = await blog.save();
    res.status(201).json({ blogId: savedBlog._id, status: "Success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all blogs
export const fetchBlogs = async (req, res) => {
    try {
      // Extract query parameters
      const { 
        title, 
        startDate, 
        endDate, 
        sortBy = "publish_date", 
        sortOrder = "desc", 
        page = 1, 
        limit = 10 
      } = req.query;
  
      // Build the query object
      const query = {};
      if (title) {
        query.title = { $regex: title, $options: "i" }; // Search blogs by title (case-insensitive)
      }
      if (startDate && endDate) {
        query.publish_date = { $gte: new Date(startDate), $lte: new Date(endDate) }; // Filter by date range
      }
  
      // Set pagination options
      const pageNumber = parseInt(page, 10);
      const pageLimit = parseInt(limit, 10);
      const skip = (pageNumber - 1) * pageLimit;
  
      // Sort options
      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;
      }
  
      // Fetch blogs with the query, sort, and pagination
      const blogs = await Blog.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit);
  
      // Count total documents for the query
      const totalBlogs = await Blog.countDocuments(query);
  
      res.status(200).json({
        totalBlogs,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalBlogs / pageLimit),
        blogs,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

// Get a specific blog with media included
export const getBlogWithMedia = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("comment")
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a blog (with optional image update)
export const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { title, content, author, publish_date, tags } = req.body;

    // Find the existing blog
    const existingBlog = await Blog.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Handle image update if a new image is uploaded
    let updatedImage = existingBlog.image;
    if (req.file) {
      // Delete the old image file if it exists
      if (existingBlog.image) {
        fs.unlink(path.join("uploads", existingBlog.image), (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      updatedImage = req.file.filename;
    }

    // Update the blog details
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      {
        title,
        content,
        author,
        publish_date,
        tags: tags ? tags.split(",") : [],
        image: updatedImage,
      },
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a blog (and its associated image)
export const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;

    // Find the blog
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete the associated image file if it exists
    if (blog.image) {
      fs.unlink(path.join("uploads", blog.image), (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    // Delete the blog from the database
    await Blog.findByIdAndDelete(blogId);

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a comment to a blog
export const addComment = async (req, res) => {
  try {
    const blogId= req.params.id;
    const { name,commentText } = req.body;
    const comment = new Comment({ name:name, comments: commentText });
    const savedComment = await comment.save();
    await Blog.findByIdAndUpdate(blogId, { $push: { comment: savedComment._id } });
    res.status(201).json({ commentId: savedComment.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment from a blog
export const deleteComment = async (req, res) => {
  try {
    const blogId = req.params.id;
    const commentId = req.params.commentId;
    await Comment.findByIdAndDelete(commentId);
    await Blog.findByIdAndUpdate(blogId, { $pull: { comment: commentId } });
    res.status(200).json({ status: "Success", message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get the number of blogs
export const getBlogCount = async (req, res) => {
  try {
    console.log("count")
    const count = await Blog.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bookmark a blog
export const bookmarkBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    blog.bookmark = !blog.bookmark;
    await blog.save();
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.status(200).json({ status: "Success", message: "Blog bookmarked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
