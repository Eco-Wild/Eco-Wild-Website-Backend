import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";

const accessAuth = async (req, res, next) => {
  try {
    // console.log(req.header("Authorization"));
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_AT_SECRET);
    const user = await User.findOne({
      email: decoded.email,
    });
    if (!user) {
      throw new Error("doesn't exist!");
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: "unAuthorized" });
  }
};

export { accessAuth };
