const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const MongoDBSession = require("connect-mongodb-session")(session);
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
const crypto = require("crypto");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const Joi = require("joi");
const saltRounds = 10;

dotenv.config();

const server = require("./server");
const patient = require("./patient");

module.exports = app;

app.set("view engine", "ejs");

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;

const mongoStore = new MongoDBSession({
  uri: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/HeartWise`,
  collection: "sessions",
});

// Use the session middleware (sessions expire after 1 hour)

const NODE_SESSION_SECRET = process.env.NODE_SESSION_SECRET;


var { database } = include("database-connection");
const userCollection = database
  .db(process.env.MONGODB_DATABASE)
  .collection(process.env.MONGODB_USERCOLLECTION);

app.use(
  session({
    secret: NODE_SESSION_SECRET,
    store: mongoStore,
    saveUninitialized: false,
    resave: false,
    rolling: true,
    cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    },
  })
);

app.get("/add-patient", server.isAuth, patient.renderAddPatients);
app.post("/add-patient", patient.addPatient);

app.get("/", server.redirectToDashboardIfAuth, server.renderIndex);
app.get("/login", server.redirectToDashboardIfAuth, server.renderLogin);
app.get("/register", server.redirectToDashboardIfAuth, server.renderRegister);
app.get("/dashboard", server.isAuth, server.renderDashboard);
app.get("/doctor-profile", server.currentUserInfo);
app.get("/under-construction", server.renderUnderConstruction);




app.post("/register", server.processRegister);
app.post("/login", server.processLogin);
app.post("/logout", server.logout);


// Attempting to implement reset password functionality
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.get("/forgot-password", (req, res) => {
  res.render("forgot-password")
})

app.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    const existingUser = await userCollection.findOne({ email: email });

    if (!existingUser) {
      return res.status(404).json({ message: `No user with email ${email}.` });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await userCollection.updateOne(
      { email: email },
      {
        $set: {
          resetToken: resetToken,
          resetTokenExpiration: Date.now() + 3600000,
        },
      }
    );

    const mailOptions = {
      from: "heartwiseincorporated@gmail.com",
      to: email,
      subject: "Password Reset",
      html: `<p>Dear ${existingUser.username},</p><p>Please click the following link to reset your password: <a href="http://localhost:3000/resetPassword/${resetToken}">Reset Password</a></p>`,
    };


    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        res.status(500).json({
          message: "Error occurred while sending password reset email.",
        });
      } else {
        console.log("Email sent:", info.response);
        res
          .status(200)
          .json({ message: "Password reset email sent successfully." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during password reset." });
  }
});

app.get("/resetPassword/:token", async (req, res) => {
  try {
    const user = await userCollection.findOne({ resetToken: req.params.token });

    if (!user) {
      return res
        .status(404)
        .render("404", { message: "Invalid or expired token." });
    }
    res.render("reset-password", { token: req.params.token }); // Create a reset-password.ejs file that allows the user to enter a new password
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error occurred during password change." });
  }
});

app.post("/resetPassword", async (req, res) => {
  // Change this route to handle POST request
  const schema = Joi.object({
    newPassword: Joi.string().required(),
    token: Joi.string().required(), // Add token in the body
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .json({ message: `Please provide ${error.details[0].message}.` });
  }

  try {
    const user = await userCollection.findOne({ resetToken: value.token });

    if (!user) {
      return res.status(404).json({ message: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(value.newPassword, saltRounds);

    await userCollection.updateOne(
      { resetToken: value.token },
      {
        $set: {
          password: hashedPassword,
          resetToken: null,
        },
      }
    );

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error occurred during password change." });
  }
});




app.get("*", (req, res) => {
  res.status(404)
  res.render("404")
})





app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
