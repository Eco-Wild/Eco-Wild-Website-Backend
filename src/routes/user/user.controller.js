import {
  validateAuth,
  setInvite,
  User
} from "../../models/user.model.js";
// import _ from "lodash";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Joi from "joi";


async function login(req, res) {
  const { error } = validateAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await findByCredentials(req.body.email, req.body.password);
    const tokens = await user.generateAuthTokens();
    res.send({ ...tokens });
  } catch (e) {
    console.log(e);
    res.status(400).send({ message: e.message });
  }
}


async function getNewAccessToken(req, res) {
  try {
    const user = req.user;
    const tokens = await user.generateNewAuthToken();
    res.send(tokens);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
}

async function changePassword(req, res) {
  try {
    const user = req.user;
    const salt = await bcrypt.genSalt(10);
    const schema = Joi.object({
      password: Joi.string().min(8).required()
    });

    const { error } = schema.validate({ password: req.body.password });
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    const password = await bcrypt.hash(req.body.password, salt);

    if (req.isFirstTime) {
      user.salt = salt;
      user.password = password;
    } else {
      const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
      if (isMatch) {
        user.password = await bcrypt.hash(req.body.password, salt);
        user.salt = salt;
      } else {
        throw new Error(`Invalid password`);
      }
    }
    await user.save();
    res.status(200).send("password changed");
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
}

async function logout(req, res){
  try {
    const user = req.user;
    user.tokens = [];
    await user.save();
    res.status(200).send({ message: "User Logged Out" });
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message || e);
  }
}

async function findByCredentials(email, password) {
  const user = await User.findOne({
    email: email,
  });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }
  return user;
}
async function forgotPassword(req, res){
  const existing = await User.findOne({ email: req.body.email });
  if (!existing) return res.status(200).json({ message: "success" });

  const user = await setInvite({
    ...req.body,
  });
  //send email with link
  try {
    // const info = await sendEmail({ ...user, forgot: true });
    console.log("Email sent successfully!", info);
    // Handle success case
  } catch (error) {
    console.error("Error sending email:", error);
    // Handle error case
  }

  console.log(user);
  if (!user) return res.status(200).json({ message: "success" });
  return res.status(201).send({ message: "success message" });
}

async function getUserProfile(req,res) {
  if(!req.user) 
    return res.status(404).send("User not found")
  const {email,phone,profile_pic} = req.user
  
  res.status(200).send({email,phone,profile_pic})
 
}

async function updateUserPhone(req, res) {
  try {
    const user = req.user;
    const schema = Joi.object({
      phone: Joi.string().required()
    });

    const { error } = schema.validate({ phone: req.body.phone });
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    user.phone = req.body.phone;
    await user.save();
    res.status(200).send({ message: "Phone number updated successfully" });
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
}

export {
  login,
  getNewAccessToken,
  changePassword,
  logout,
  forgotPassword,
  getUserProfile,
  updateUserPhone
};
