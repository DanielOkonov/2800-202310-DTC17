// Import required modules
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const mongoose = require("mongoose");
const Joi = require("joi");
const UserModel = require("./models/user");

// Load environment variables
dotenv.config();

// Initialize app and constants
const app = express();
const NODE_SESSION_SECRET = process.env.NODE_SESSION_SECRET;
const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const saltRounds = 12;

// Set view engine and views folder
app.set("view-engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware configuration
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Joi validation schemas
const schema = Joi.object({
  username: Joi.string().alphanum().max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().max(20).required(),
  admin: Joi.boolean().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().max(20).required(),
});

// Connect to MongoDB
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("MongoDB Connected");
  });

// Middleware to protect routes
exports.isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Middleware to redirect to dashboard if authenticated
exports.redirectToDashboardIfAuth = (req, res, next) => {
  if (req.session.isAuth) {
    res.redirect("/dashboard");
  } else {
    next();
  }
};

// Routes
exports.renderIndex = function (req, res) {
  res.render("index.ejs");
};

exports.renderLogin = function (req, res) {
  res.render("login.ejs", { error: null });
};

exports.renderRegister = function (req, res) {
  res.render("register.ejs");
};

exports.renderDashboard = function (req, res) {
  res.render("dashboard.ejs");
};

exports.renderDoctorProfile = function (req, res) {
  res.render("doctor-profile.ejs");
};

exports.processRegister = async function (req, res) {
  const { username, email, password } = req.body;
  const admin = req.body.admin === "on" ? true : false;

  const validationResult = schema.validate({
    username,
    email,
    password,
    admin,
  });
  if (validationResult.error) {
    console.log(validationResult.error);
    return res.redirect("/register");
  }

  let user = await UserModel.findOne({ email });

  if (user) {
    return res.redirect("/register");
  }

  try {
    const hashedPsw = await bcrypt.hash(password, saltRounds);

    user = new UserModel({
      username,
      email,
      password: hashedPsw,
      admin: admin,
    });

    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.error("Error hashing password:", error);
    res.redirect("/register");
  }
};

exports.processLogin = async function (req, res) {
  const validationResult = loginSchema.validate(req.body);
  if (validationResult.error) {
    console.log(validationResult.error);
    return res.redirect("/login");
  }
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });

  if (!user) {
    return res
      .status(400)
      .render("login.ejs", { error: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res
      .status(400)
      .render("login.ejs", { error: "Invalid email or password" });
  }

  req.session.isAuth = true;
  req.session.userEmail = email; // Store the user's email in the session
  res.redirect("/dashboard");
};

exports.logout = function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("An error occurred while logging out.");
    }

    res.clearCookie("connect.sid"); // Clear the session cookie
    res.redirect("/login");
  });
};

exports.currentUserInfo = async function (req, res) {
  const email = req.session.userEmail;
  const user = await UserModel.findOne({ email: email });
  // console.log("user from db: " + JSON.stringify(user));

  console.log("Current user email: " + email);
  console.log("Current user username: " + user.username);

  res.render("doctor-profile", {
    user: user,
    userEmail: email,
  });
};

app.use((req, res) => {
  res.status(404).render("404.ejs");
});
