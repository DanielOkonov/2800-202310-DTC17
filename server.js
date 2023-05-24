// //Updated imports
// const dotenv = require("dotenv");
// const express = require("express");
// const path = require("path");
// const bcrypt = require("bcrypt");
// const session = require("express-session");
// const { MongoClient } = require("mongodb");
// const MongoStore = require("connect-mongo");
// const mongoose = require("mongoose");
// const Joi = require("joi");
// const UserModel = require("./models/user");

// // Load environment variables
// dotenv.config();

// // Initialize app and constants
// const app = express();
// const NODE_SESSION_SECRET = process.env.NODE_SESSION_SECRET;
// const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
// const saltRounds = 12;

// const client = new MongoClient(url, { useUnifiedTopology: true });

// // Set view engine and views folder
// app.set("view-engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// // Middleware configuration
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

// // Joi validation schemas
// const schema = Joi.object({
//   username: Joi.string().alphanum().max(20).required(),
//   email: Joi.string().email().required(),
//   password: Joi.string().max(20).required(),
//   admin: Joi.boolean().optional(),
// });

// const loginSchema = Joi.object({
//   email: Joi.string().email().required(),
//   password: Joi.string().max(20).required(),
// });

// // Connect to MongoDB
// mongoose
//   .connect(url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then((res) => {
//     console.log("MongoDB Connected");
//   });

// // Session configuration
// const mongoStore = MongoStore.create({
//   mongoUrl: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/HeartWise`,
//   crypto: {
//     secret: process.env.MONGODB_SESSION_SECRET,
//   },
// })

// app.use(
//   session({
//     secret: process.env.NODE_SESSION_SECRET,
//     store: mongoStore,
//     saveUninitialized: false,
//     resave: true,
//   })
// );

// // Middleware to protect routes
// exports.isAuth = (req, res, next) => {
//   if (req.session.isAuth) {
//     next();
//   } else {
//     res.redirect("/login");
//   }
// };

// // Middleware to redirect to dashboard if authenticated
// exports.redirectToDashboardIfAuth = (req, res, next) => {
//   if (req.session.isAuth) {
//     res.redirect("/dashboard");
//   } else {
//     next();
//   }
// };

// // Routes
// exports.renderIndex = function (req, res) {
//   res.render("index.ejs");
// };

// exports.renderLogin = function (req, res) {
//   res.render("login.ejs", { error: null });
// };

// exports.renderRegister = function (req, res) {
//   res.render("register.ejs");
// };

// exports.renderDashboard = function (req, res) {
//   res.render("dashboard.ejs");
// };

// exports.processRegister = async function (req, res) {
//   const { username, email, password } = req.body;
//   const admin = req.body.admin === "on" ? true : false;

//   const validationResult = schema.validate({
//     username,
//     email,
//     password,
//     admin,
//   });
//   if (validationResult.error) {
//     console.log(validationResult.error);
//     return res.redirect("/register");
//   }

//   let user = await UserModel.findOne({ email });

//   if (user) {
//     return res.redirect("/register");
//   }

//   try {
//     const hashedPsw = await bcrypt.hash(password, saltRounds);

//     user = new UserModel({
//       username,
//       email,
//       password: hashedPsw,
//       admin: admin,
//     });

//     await client.connect();
//     const db = client.db(process.env.MONGODB_DATABASE);
//     const userCollection = db.collection(process.env.MONGODB_USERCOLLECTION);
//     await userCollection.insertOne(user);

//     res.redirect("/login");
//   } catch (error) {
//     console.error("Error hashing password:", error);
//     res.redirect("/register");
//   }
// };

// exports.processLogin = async function (req, res) {
//   // const validationResult = loginSchema.validate(req.body);
//   // if (validationResult.error) {
//   //   console.log(validationResult.error);
//   //   return res.redirect("/login");
//   // }
//   // const { email, password } = req.body;

//   // const user = await UserModel.findOne({ email });

//   // if (!user) {
//   //   return res
//   //     .status(400)
//   //     .render("login.ejs", { error: "Invalid email or password" });
//   // }

//   // const isMatch = await bcrypt.compare(password, user.password);

//   // if (!isMatch) {
//   //   return res
//   //     .status(400)
//   //     .render("login.ejs", { error: "Invalid email or password" });
//   // }
//   let email = req.body.email;
//   let password = req.body.password;

//   await client.connect();
//   const db = client.db(process.env.MONGODB_DATABASE);
//   const userCollection = db.collection(process.env.MONGODB_USERCOLLECTION);

//   const result = await userCollection
//     .find({email: email})
//     .project({email: 1, password: 1, admin: 1, _id: 1})
//     .toArray();

//   if(result.length != 1){
//     return res
//       .status(400)
//       .redirect("login.ejs", { error: "Invalid email or password"} );
//   }
//   if (await bcrypt.compare(password, result[0].password)) {
//     console.log("correct password");
//     req.session.isAuth = true;

//     // req.session.isAuth = true;
//     // req.session.userEmail = result[0].email;
//     // req.session.cookie.maxAge = 3600000;
//     // req.session.admin = result[0].admin;
//     res.redirect("/dashboard");
//     return;
//   }

//   // req.session.isAuth = true;
//   // req.session.cookie.maxAge = 3600000 // 1 hour
//   // req.session.userEmail = email; // Store the user's email in the session
//   // res.redirect("/dashboard");
// };

// exports.logout = function (req, res) {
//   req.session.destroy((err) => {
//     if (err) {
//       console.error("Error destroying session:", err);
//       return res.status(500).send("An error occurred while logging out.");
//     }

//     res.clearCookie("connect.sid"); // Clear the session cookie
//     res.redirect("/login");
//   });
// };

// app.use((req, res) => {
//   res.status(404).render("404.ejs");
// });

//Updated imports
require("./utils.js");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const Joi = require("joi");

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
const schema = Joi.object({
  username: Joi.string()
    .regex(/^[\w-\s]+$/)
    .max(20)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().max(20).required(),
  admin: Joi.boolean().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().max(20).required(),
});

// // Session configuration
// const mongoStore = MongoStore.create({
//   mongoUrl: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/HeartWise`,
//   crypto: {
//     secret: process.env.MONGODB_SESSION_SECRET,
//   },
// })

// app.use(
//   session({
//     secret: process.env.NODE_SESSION_SECRET,
//     store: mongoStore,
//     saveUninitialized: false,
//     resave: true,
//   })
// );

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

  // const schema = Joi.object({
  //   username: Joi.string().alphanum().max(30).required(),
  //   password: Joi.string().max(20).required(),
  //   email: Joi.string().email({
  //     minDomainSegments: 2,
  //     tlds: { allow: ["com", "ca"] },
  //   }),
  // });

  const validationResult = schema.validate({
    username: username,
    password: password,
    email: email,
  });

  if (validationResult.error != null) {
    console.log(validationResult.error.message);
    return res.redirect("/register");
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
