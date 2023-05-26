//Updated imports
require("./utils.js");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const Joi = require("joi");
const zxcvbn = require("zxcvbn");

console.log("Script loaded!");

// Load environment variables
dotenv.config();

// Initialize app and constants
const app = express();
var { database } = include("database-connection");
const userCollection = database
  .db(process.env.MONGODB_DATABASE)
  .collection(process.env.MONGODB_USERCOLLECTION);

// Set view engine and views folder
app.set("view-engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware configuration
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Joi validation schemas
const passwordSchema = Joi.string()
  .min(8)
  .max(50)
  .custom((value, helpers) => {
    const result = zxcvbn(value);
    // Customize the minimum strength as necessary (score is 0-4)
    if (result.score < 3) {
      return helpers.message(
        "Password is too weak. It must include a combination of letters, numbers, and special characters."
      );
    }
    return value;
  }, "Password Strength Validation")
  .messages({
    "string.min": "Password length must be at least 8 characters long.",
  })
  .required();

const schema = Joi.object({
  username: Joi.string().alphanum().max(20).required(),
  email: Joi.string().email().required(),
  password: passwordSchema,
  admin: Joi.boolean().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().max(20).required(),
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
    res.redirect("/patient-list");
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

exports.renderUnderConstruction = function (req, res) {
  res.render("under-construction.ejs");
};

exports.processRegister = async function (req, res) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var admin = req.body.admin === "on" ? true : false;

  const validationResult = schema.validate({
    username,
    email,
    password,
    admin,
  });

  if (validationResult.error) {
    console.log(validationResult.error);
    // Pass the error message to your view to display to the user
    return res.render("register.ejs", {
      error: validationResult.error.details[0].message,
    });
  }

  var hashedPassword = await bcrypt.hash(password, 12);

  await userCollection.insertOne({
    username: username,
    email: email,
    password: hashedPassword,
    admin: admin,
  });
  res.redirect("/login");
};

exports.processLogin = async function (req, res) {
  let email = req.body.email;
  let password = req.body.password;

  const result = await userCollection
    .find({ email: email })
    .project({ email: 1, password: 1, admin: 1, _id: 1, username: 1 })
    .toArray();

  if (result.length != 1) {
    return res
      .status(400)
      .render("login", { error: "Invalid email or password" });
  }
  if (await bcrypt.compare(password, result[0].password)) {
    req.session.isAuth = true;
    req.session.username = result[0].username;
    req.session.userEmail = result[0].email;
    req.session.cookie.maxAge = 3600000;
    req.session.admin = result[0].admin;
    res.redirect("/patient-list");
    return;
  } else {
    return res
      .status(400)
      .render("login", { error: "Invalid email or password" });
  }
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
  // const user = await UserModel.findOne({ email: email });
  const user = req.session.username;
  // console.log("user from db: " + JSON.stringify(user));

  console.log("Current user email: " + email);
  console.log("Current user username: " + user);

  res.render("doctor-profile", {
    user: user,
    userEmail: email,
  });
};
