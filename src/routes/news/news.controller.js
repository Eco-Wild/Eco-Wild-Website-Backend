import News from "../../models/news.model.js";
import fs from "fs";
import path from "path";
import multer from "multer";

// Multer setup (same as before)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
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

// Create news with image upload
export const createNews = async (req, res) => {
  try {
    const { title, content, author, publish_date, category } = req.body;
    const image = req.file ? req.file.path : null;

    const news = new News({
      title,
      content,
      author,
      publish_date,
      category,
      image,
    });

    const savedNews = await news.save();
    res.status(201).json({ newsId: savedNews._id, status: "Success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update news (with optional image update)
export const updateNews = async (req, res) => {
  try {
    const newsId = req.params.id;
    const { title, content, author, publish_date, category } = req.body;

    // Find the existing news
    const existingNews = await News.findById(newsId);
    if (!existingNews) {
      return res.status(404).json({ message: "News not found" });
    }

    // Handle image update if a new image is uploaded
    let updatedImage = existingNews.image;
    if (req.file) {
      // Delete the old image file if it exists
      if (existingNews.image) {
        fs.unlink(existingNews.image, (err) => {
          if (err) console.error("Error deleting old image:", err);
        });
      }
      updatedImage = req.file.path;
    }

    // Update the news details
    const updatedNews = await News.findByIdAndUpdate(
      newsId,
      {
        title,
        content,
        author,
        publish_date,
        category,
        image: updatedImage,
      },
      { new: true } // Return the updated document
    );

    res.status(200).json(updatedNews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete news (and its associated image)
export const deleteNews = async (req, res) => {
  try {
    const newsId = req.params.id;

    // Find the news
    const news = await News.findById(newsId);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }

    // Delete the associated image file if it exists
    if (news.image) {
      fs.unlink(news.image, (err) => {
        if (err) console.error("Error deleting image:", err);
      });
    }

    // Delete the news from the database
    await News.findByIdAndDelete(newsId);

    res.status(200).json({ message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Fetch news (with search, filter, sort, and pagination)
export const fetchNews = async (req, res) => {
  try {
    const {
      title,
      startDate,
      endDate,
      sortBy = "publish_date",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    // Build query object
    const query = {};
    if (title) {
      query.title = { $regex: title, $options: "i" }; // Search news by title (case-insensitive)
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

    // Fetch news with the query, sort, and pagination
    const news = await News.find(query).sort(sortOptions).skip(skip).limit(pageLimit);

    // Count total documents for the query
    const totalNews = await News.countDocuments(query);

    res.status(200).json({
      totalNews,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalNews / pageLimit),
      news,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get specific news with media included
export const getNewsWithMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id)
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json(news);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get total number of news
export const getNewsCount = async (req, res) => {
  try {
    const totalNews = await News.countDocuments();
    res.status(200).json({ totalNews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bookmark news
export const bookmarkNews = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    news.bookmark = !news.bookmark;
    await news.save();
    res.status(200).json({ status: "Success", message: "News bookmarked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
