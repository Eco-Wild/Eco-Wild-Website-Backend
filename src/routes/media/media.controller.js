import fs from "fs";
import path from "path";
import multer from "multer";
import Media from "../../models/media.model.js";

// Multer setup for image uploads
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

// Upload a single image
export const uploadImage = async (req, res) => {
  try {
    const { title, type, tags, category } = req.body;
    const source = req.file ? req.file.filename : null;

    if (!source) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const media = new Media({ source, title, type, tags, category });
    const savedMedia = await media.save();

    res.status(201).json({ mediaId: savedMedia._id, status: "Success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload a video (YouTube link)
export const uploadVideo = async (req, res) => {
  try {
    const { source, title, type, tags, category } = req.body;
    if (!source || !source.startsWith("http")) {
      return res.status(400).json({ message: "Valid YouTube link is required." });
    }

    const media = new Media({ source, title, type, tags, category });
    const savedMedia = await media.save();

    res.status(201).json({ mediaId: savedMedia._id, status: "Success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an image
export const updateImage = async (req, res) => {
  try {
    const mediaId = req.params.id;
    const { title, type, tags, category } = req.body;

    const existingMedia = await Media.findById(mediaId);
    if (!existingMedia) {
      return res.status(404).json({ message: "Media not found." });
    }

    let updatedSource = existingMedia.source;
    if (req.file) {
      // Delete old image
      const oldPath = path.join("uploads", existingMedia.source);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      updatedSource = req.file.filename;
    }

    const updatedMedia = await Media.findByIdAndUpdate(
      mediaId,
      { source: updatedSource, title, type, tags, category },
      { new: true }
    );

    res.status(200).json(updatedMedia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a video
export const updateVideo = async (req, res) => {
  try {
    const mediaId = req.params.id;
    const { source, title, type, tags, category } = req.body;
    
    if (!source || !source.startsWith("http")) {
      return res.status(400).json({ message: "Valid YouTube link is required." });
    }

    const updatedMedia = await Media.findByIdAndUpdate(
      mediaId,
      { source, title, type, tags, category },
      { new: true }
    );

    res.status(200).json(updatedMedia);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an image
export const deleteImage = async (req, res) => {
  try {
    const mediaId = req.params.id;

    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: "Media not found." });
    }

    if (media.source) {
      const imagePath = path.join("uploads", media.source);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Media.findByIdAndDelete(mediaId);

    res.status(200).json({ message: "Image deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a video
export const deleteVideo = async (req, res) => {
  try {
    const mediaId = req.params.id;

    const media = await Media.findById(mediaId);
    if (!media) {
      return res.status(404).json({ message: "Media not found." });
    }

    await Media.findByIdAndDelete(mediaId);

    res.status(200).json({ message: "Video deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch all images
export const fetchImages = async (req, res) => {
  try {
    const images = await Media.find({ type: "image" });
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch all videos
export const fetchVideos = async (req, res) => {
  try {
    const videos = await Media.find({ type: "video" });
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
