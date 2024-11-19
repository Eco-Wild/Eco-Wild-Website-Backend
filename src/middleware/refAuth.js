import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";

const refAuth = async (req, res, next) => {
  let token = req.header("Authorization")?.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, process.env.JWT_RT_SECRET);

    const user = await getUser(decoded, token);
 
    if (!user) {
      throw new Error("doesnt exist!");
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    if (e.message === "jwt expired") {
      const decoded = jwt.decode(token);
      console.log(decoded);
      const updated = await getUser(decoded, token);
      if (updated) {
        updated.tokens = updated.tokens.filter((t) => t !== token);
        updated.save();
      }
    }
    return res.status(401).send({ error: "unAuthorized" });
  }
};
async function getUser(decoded, token){
  const user = await User.findOne({
    email: decoded.email,
    tokens: { $in: [token] },
  });

  return user;
}

export { refAuth };
