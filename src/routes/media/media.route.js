import express from "express";
import {
  uploadImage,
  uploadVideo,
  updateImage,
  updateVideo,
  deleteImage,
  deleteVideo,
  fetchImages,
  fetchVideos,
  upload,
} from "./media.controller.js";

const router = express.Router();

// Image routes
router.post("/image", upload.single("source"), uploadImage);
router.put("/image/:id", upload.single("source"), updateImage);
router.delete("/image/:id", deleteImage);
router.get("/images", fetchImages);

// Video routes
router.post("/video", uploadVideo);
router.put("/video/:id", updateVideo);
router.delete("/video/:id", deleteVideo);
router.get("/videos", fetchVideos);

export default router;
