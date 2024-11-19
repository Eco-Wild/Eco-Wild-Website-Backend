import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";

const inviteAuth = async (req, res, next) => {
  try {
    console.log("req", req.body, req.header("Authorization"));
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_IT_SECRET);
   
    const user = await User.findOne({
      email: decoded.email,
    });

    console.log(user);
    if (!user) {
      throw new Error("doesnt exist!");
    }
    req.token = token;
    req.user = user;
    req.isFirstTime = true;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: "unAuthorized" });
  }
};
export { inviteAuth };
