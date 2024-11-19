import Destination from "../../models/destination.model.js";
import Comment from "../../models/comment.model.js";
import fs from "fs";
import path from "path";

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "./uploads/";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({ storage });

// Add a new destination
export const createDestination = async (req, res) => {
  try {
    const { title, description, publish_date, location, tags } = req.body;

    const profileImage = req.files["profile_image"]?.[0]?.filename; // Single image
    const images = req.files["images"]?.map((file) => file.filename); // Array of images

    const destination = new Destination({
      title,
      description,
      profile_image: profileImage || null,
      images: images || [],
      publish_date: publish_date ? new Date(publish_date) : null,
      location,
      tags: tags ? tags.split(",") : [],
    });

    const savedDestination = await destination.save();
    res.status(201).json({ destinationId: savedDestination.id, status: "Success" });
  } catch (error) {
    res.status(500).json({ status: "Failure", error: error.message });
  }
};

// Update an existing destination
export const updateDestination = async (req, res) => {
  try {
    const destinationId = req.params.id;

    const { title, description, publish_date, location, tags } = req.body;

    const profileImage = req.files["profile_image"]?.[0]?.filename; // Single image
    const images = req.files["images"]?.map((file) => file.filename); // Array of images

    const updateData = {
      title,
      description,
      profile_image: profileImage || undefined,
      images: images || undefined,
      publish_date: publish_date ? new Date(publish_date) : undefined,
      location,
      tags: tags ? tags.split(",") : undefined,
    };

    // Remove undefined values from updateData
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updatedDestination = await Destination.findByIdAndUpdate(destinationId, updateData, { new: true });

    if (!updatedDestination) return res.status(404).json({ error: "Destination not found" });

    res.status(200).json(updatedDestination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all destinations
export const fetchDestinations = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      title, 
      location, 
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
      query.title = { $regex: title, $options: "i" }; // Search destinations by title (case-insensitive)
    }
    if (location) {
      query.location = { $regex: location, $options: "i" }; // Search destinations by location
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
  
    // Fetch destinations with the query, sort, and pagination
    const destinations = await Destination.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);
  
    // Count total documents for the query
    const totalDestinations = await Destination.countDocuments(query);
  
    res.status(200).json({
      totalDestinations,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalDestinations / pageLimit),
      destinations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific destination with comments
export const getDestinationWithComments = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id).populate("comments");
    if (!destination) return res.status(404).json({ error: "Destination not found" });
    res.status(200).json(destination);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a destination by ID
export const deleteDestination = async (req, res) => {
  try {
    const destinationId = req.params.id;

    // Find the destination to get the image paths
    const destination = await Destination.findById(destinationId);
    if (!destination) return res.status(404).json({ error: "Destination not found" });

    // Delete the profile image if it exists
    if (destination.profile_image) {
      const profileImagePath = path.join("./uploads", destination.profile_image);
      if (fs.existsSync(profileImagePath)) {
        fs.unlinkSync(profileImagePath);
      }
    }

    // Delete each image in the images array
    if (destination.images && destination.images.length > 0) {
      destination.images.forEach((image) => {
        const imagePath = path.join("./uploads", image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }

    // Remove the destination from the database
    const deletedDestination = await Destination.findByIdAndDelete(destinationId);
    res.status(200).json({ status: "Success", message: "Destination and associated images deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Add a comment to a destination
export const addComment = async (req, res) => {
  try {
    const destinationId= req.params.id;
    const { name,commentText } = req.body;
    const comment = new Comment({ name:name, comments: commentText });
    const savedComment = await comment.save();
    await Destination.findByIdAndUpdate(destinationId, { $push: {comments: savedComment._id } });
    res.status(201).json({ commentId: savedComment.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a comment from a destination
export const deleteComment = async (req, res) => {
  try {
    const destinationId = req.params.id;
    const commentId = req.params.commentId;
    await Comment.findByIdAndDelete(commentId);
    await Destination.findByIdAndUpdate(destinationId, { $pull: { comments: commentId } });
    res.status(200).json({ status: "Success", message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get the number of destinations
export const getDestinationCount = async (req, res) => {
  try {
    const count = await Destination.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bookmark a destination
export const bookmarkDestination = async (req, res) => {
  try {
    const destinationId = req.params.id;
    const destination = await Destination.findById(destinationId);
    if (!destination) return res.status(404).json({ error: "Destination not found" });
    destination.bookmark = !destination.bookmark;
    await destination.save();
    res.status(200).json({ status: "Success", message: "Destination bookmarked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
