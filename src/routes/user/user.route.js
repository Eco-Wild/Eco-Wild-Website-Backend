import { Router } from "express";
import {
  login,
  getNewAccessToken,
  changePassword,
  logout,
  forgotPassword,
  getUserProfile,
  updateUserPhone
} from "./user.controller.js";

import { accessAuth } from "../../middleware/auth.js";
import { refAuth } from "../../middleware/refAuth.js";
import { inviteAuth } from "../../middleware/inviteAuth.js";

const auth = Router();

auth.post("/login", login);
auth.get("/me", [accessAuth], getUserProfile);
auth.post("/refresh", [refAuth], getNewAccessToken);
auth.post("/logout", accessAuth, logout);
auth.patch("/password", accessAuth, changePassword);
auth.patch("/invitePass", inviteAuth, changePassword);
auth.patch("/forgotpassword", forgotPassword);
auth.patch("/phone",accessAuth,updateUserPhone)


export default auth;