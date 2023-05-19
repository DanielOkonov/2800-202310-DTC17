const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const MongoDBSession = require("connect-mongodb-session")(session);
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Joi = require("joi");
const saltRounds = 10;

app.use("/public/", express.static("./public"));

const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // files will be saved in the 'uploads' directory. You can change this to suit your needs

dotenv.config();

const server = require("./server");
const patient = require("./patient");
const {
  createDummyPatients,
} = require("./controllers/patients/dummyDataGenerator");
const {
  deleteAllPatients,
} = require("./controllers/patients/deletePatientCollection");

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
app.get("/patient-list", server.isAuth, patient.getPatients);
app.post("/patient-list", server.isAuth, patient.addPatient);
app.get("/search", patient.searchPatients);
app.get("/patient/:id", patient.getPatientProfile);
app.get("/analysis-result/:patientId/:analysisId", patient.getAnalysisResult);

app.get("/create-dummy-patients", server.isAuth, async (req, res) => {
  const loggedInUsername = req.session.username;
  await createDummyPatients(loggedInUsername);
  res.send("Dummy patients created successfully.");
});
app.get("/delete-all-patients", server.isAuth, async (req, res) => {
  await deleteAllPatients();
  res.send("All patient entries deleted successfully.");
});

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

app.get("/forgot-password", function (req, res) {
  res.render("forgot-password", { message: "Your custom error message here" });
});

app.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;

    const existingUser = await userCollection.findOne({ email: email });

    if (!existingUser) {
      return res.render("error", { message: `No user with email ${email}.` }); // render an error page
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
      html: `<p>Dear ${existingUser.username},</p><p>Please click the following link to reset your password: <a href="http://localhost:3000/resetPassword/${resetToken}">Reset Password.</a></p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.render("error", {
          message: "Error occurred while sending password reset email.",
        }); // render an error page
      } else {
        console.log("Email sent:", info.response);
        return res.render("success", {
          message: "Password reset email sent successfully.",
        }); // render a success page
      }
    });
  } catch (error) {
    console.error(error);
    res.render("error", { message: "Error occurred during password reset." }); // render an error page
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
    return res.render("error", {
      message: `Please provide ${error.details[0].message}.`,
    }); // render an error page
  }

  try {
    const user = await userCollection.findOne({ resetToken: value.token });

    if (!user) {
      return res.render("error", { message: "Invalid or expired token." }); // render an error page
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

    return res.render("success", { message: "Password changed successfully." }); // render a success page
  } catch (error) {
    console.error(error);
    return res.render("error", {
      message: "Error occurred during password change.",
    }); // render an error page
  }
});

app.get("/analyze", (req, res) => {
  res.render("analyze");
});

app.get("/share", (req, res) => {
  res.render("share"); // replace 'share-button' with the correct path to your share-button.ejs file if it's not in the views directory
});

app.post("/email-pdf", upload.single("pdf"), async (req, res, next) => {
  try {
    const { email } = req.body;
    const pdfPath = req.file.path;

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: "Here is the PDF you requested",
      text: "Please find the PDF attached.",
      attachments: [
        {
          filename: "file.pdf",
          path: pdfPath,
          contentType: "application/pdf",
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res
          .status(500)
          .json({ message: "Error occurred while sending email." });
      } else {
        console.log("Email sent:", info.response);
        return res.render("success", { message: "Email sent successfully." });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred during email sending." });
  }
});

app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
