import express from "express";
import { sendEmail } from "./contact.controller.js";

const router = express.Router();

// Send email
router.post("/", sendEmail);

export default router;
