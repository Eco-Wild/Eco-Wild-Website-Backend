import mongoose from "mongoose";
import dotenv from "dotenv";
import {User} from "../../models/user.model.js";
dotenv.config();

const mongo = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {});
    console.log("Database Connected");
    User.checkAndCreateDefaultUser();
  } catch (err) {
    console.log(`MongoDB connection error: ${err}`);
  }
};

export default mongo;
