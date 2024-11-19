import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";
import bcrypt from "bcrypt";

// Define the schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, min: 5, max: 40 },
  password: { type: String, required: true, min: 5, max: 1024 },
  phone: { type: String, required: false, min: 5, max: 255 },
  tokens: { type: [String], default: [] },
  salt: { type: String, required: true },
  profile_pic: { type: String, required: false },
  invitations: {type: String, required:false}
});

UserSchema.statics.checkAndCreateDefaultUser = async function () {
  const defaultEmail = process.env.DEFAULT_USER_EMAIL;
  const defaultPassword = process.env.DEFAULT_USER_PASSWORD;

  if (!defaultEmail || !defaultPassword) {
    throw new Error("Default email or password is not set in environment variables");
  }

  const user = await this.findOne({ email: defaultEmail });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);
    const newUser = new this({
      email: defaultEmail,
      password: hashedPassword,
      salt: salt,
    });
    await newUser.save();
    console.log("Default user created");
  } else {
    console.log("Default user already exists");
  }
};

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });
  return schema.validate(user);
}

function validateAuth(user) {
  const schema = Joi.object({
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });
  return schema.validate(user);
}

// Create and export the model
UserSchema.method("generateAuthTokens", async function () {
  const email = this.email.toString();
  const accessToken = jwt.sign(
    { email: email},
    process.env.JWT_AT_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { email: email },
    process.env.JWT_RT_SECRET,
    { expiresIn: "7d" }
  );
  this.tokens.push(refreshToken);
  await this.save();
  return { accessToken, refreshToken };
});

UserSchema.method("generateNewAuthToken", async function () {
  const email = this.email.toString();
  const accessToken = jwt.sign(
    { email: email },
    process.env.JWT_AT_SECRET,
    { expiresIn: "1h" }
  );
  return { accessToken };
});

UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("invalid email or password");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("invalid email or password");
  }
  return user;
};

async function setInvite(user){
  const invitations = jwt.sign(
    { email: user.email },
    process.env.JWT_IT_SECRET,
    { expiresIn: "7d" }
  );
  userResult.invitations = invitations;
  try {
    await userResult.save();
    return {
      email: userResult.email,
      invitations,
      username: userResult.username,
    };
  } catch (error) {
    return (error).message;
  }
}

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // console.log("changePassword");
    // this.password = await bcrypt.hash(this.password , 8)
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export {User, validateUser,validateAuth,setInvite};
