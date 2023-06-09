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
const { exec } = require("child_process");
const path = require("path");
const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");

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
app.post("/patient-list", patient.addPatient);
app.get("/search", server.isAuth, patient.searchPatients);
app.get("/patient/:id", server.isAuth, patient.getPatientProfile);
app.get(
  "/analysis-result/:patientId/:analysisId",
  server.isAuth,
  patient.getAnalysisResult
);
app.get(
  "/patient-risk-history/:id",
  server.isAuth,
  patient.getPatientRiskHistory
);

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

// Renders the forgot-password page
app.get("/forgot-password", function (req, res) {
  res.render("forgot-password", { message: "Your custom error message here" });
});

// Processes the forgot-password request and sends reset password email if user is found
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
      html: `
    <div style="text-align: center;">
      <h1>Heart Wise Password Reset</h1>
      <p>Dear ${existingUser.username},</p>
      <p>Please click the following link to reset your password:</p>
      <p><a href="http://localhost:3000/resetPassword/${resetToken}">Reset Password</a></p>
      <hr />
      <h2>Privacy Policy</h2>
      <p>Your privacy is of utmost importance to us. We handle your data with the greatest care, ensuring it is used only for the purpose for which you have given consent.</p>
      <h2>Attribution</h2>
      <p>This service is provided by Heart Wise Inc., a pioneer in heart health technologies.</p>
      <hr />
      <p><small>If you have received this email in error, please immediately delete it and all copies of it from your system, destroy any hard copies of it, and notify the sender. You must not, directly or indirectly, use, disclose, distribute, print, or copy any part of this message if you are not the intended recipient.</small></p>
    </div>
  `,
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

// Route for displaying the password reset page.
// It takes a token parameter which is checked against the database for validation
app.get("/resetPassword/:token", async (req, res) => {
  try {
    const user = await userCollection.findOne({ resetToken: req.params.token });

    if (!user) {
      return res
        .status(404)
        .render("404", { message: "Invalid or expired token." });
    }

    // If the user exists, render the password reset page and pass the token to it
    res.render("reset-password", { token: req.params.token }); // Create a reset-password.ejs file that allows the user to enter a new password
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error occurred during password change." });
  }
});

// Route for handling the password reset form submission
app.post("/resetPassword", async (req, res) => {
  const schema = Joi.object({
    newPassword: Joi.string().required(),
    token: Joi.string().required(), // Add token in the body
  });

  // Validate the request body against the schema
  const { error, value } = schema.validate(req.body);

  // If validation fails, render an error page with a message
  if (error) {
    return res.render("error", {
      message: `Please provide ${error.details[0].message}.`,
    }); // render an error page
  }

  try {
    // Find a user in the database with a matching reset token
    const user = await userCollection.findOne({ resetToken: value.token });

    // If no such user exists, render an error page
    if (!user) {
      return res.render("error", { message: "Invalid or expired token." }); // render an error page
    }

    // If the user exists, hash the new password
    const hashedPassword = await bcrypt.hash(value.newPassword, saltRounds);

    // Update the user in the database by setting the hashed password and removing the reset token
    await userCollection.updateOne(
      { resetToken: value.token },
      {
        $set: {
          password: hashedPassword,
          resetToken: null,
        },
      }
    );

    // After the password has been successfully updated, render a success page
    return res.render("success", { message: "Password changed successfully." }); // render a success page
  } catch (error) {
    console.error(error);
    return res.render("error", {
      message: "Error occurred during password change.",
    }); // render an error page
  }
});

// Analyze page route, with query parameters
app.get("/analyze", function (req, res) {
  var query = req.query.q;

  res.render("analyze", { query: query });
});

// Live search functionality for patient information
app.get("/api/livesearch", patient.liveSearchPatients);

// Share page route
app.get("/share", (req, res) => {
  res.render("share");
});

// Sends a patient's result in a PDF via email
app.post("/email-pdf", upload.single("pdf"), async (req, res, next) => {
  try {
    const { email } = req.body;
    const pdfPath = req.file.path;

    const mailOptions = {
      from: process.env.EMAIL_ADDRESS,
      to: email,
      subject: "Heart Wise Patient Result PDF",
      html: `
    <div style="text-align: center;">
      <h1>Heart Wise Patient Result PDF</h1>
      <p>To whom it may concern, please find the requested patient PDF attached.</p>
      <hr />
      <h2>Privacy Policy</h2>
      <p>Your privacy is of utmost importance to us. We handle your data with the greatest care, ensuring it is used only for the purpose for which you have given consent.</p>
      <h2>Attribution</h2>
      <p>This service is provided by Heart Wise Inc., a pioneer in heart health technologies.</p>
      <hr />
      <p><small>If you have received this email in error, please immediately delete it and all copies of it from your system, destroy any hard copies of it, and notify the sender. You must not, directly or indirectly, use, disclose, distribute, print, or copy any part of this message if you are not the intended recipient.</small></p>
    </div>
  `,
      attachments: [
        {
          filename: "results.pdf",
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

// Allows server to accept URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Runs Python script for analysis
function runPythonScript(serumCreatinine, ejectionFraction) {
  return new Promise((resolve, reject) => {
    const pythonScript = "scripts\\analysis.py";
    const command = `python ${pythonScript} ${serumCreatinine} ${ejectionFraction}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      const result = stdout.trim();
      resolve(result);
    });
  });
}

// Inserts analysis data into MongoDB
function insertDataIntoMongoDB(
  serumCreatinine,
  ejectionFraction,
  result,
  userId,
  patientId
) {
  const uri = url;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return client
    .connect()
    .then(() => {
      const db = client.db(process.env.MONGODB_DATABASE);
      const collection = db.collection(process.env.MONGODB_PATIENTCOLLECTION);

      const query = { _id: new ObjectId(patientId) };

      return collection.findOne(query).then((user) => {
        if (!user) {
          console.log("User not found in the database.");
          return;
        }
        const update = {
          $push: {
            analysis: {
              $each: [
                {
                  analysisDate: new Date(),
                  conductedBy: userId,
                  ejectionFraction: ejectionFraction,
                  serumCreatinine: serumCreatinine,
                  analysisResult: result,
                },
              ],
              $position: 0,
            },
          },
        };

        return collection.updateOne(query, update);
      });
    })
    .finally(() => {
      client.close();
    });
}

// Handles form submission of patient analysis and processes results
app.post("/result", (req, res) => {
  const serumCreatinine = req.body["serum-creatinine"];
  const ejectionFraction = req.body["ejection-fraction"];
  const patientId = req.body["patient-id"];

  MongoClient.connect(url, { useUnifiedTopology: true })
    .then((client) => {
      const db = client.db(process.env.MONGODB_DATABASE);
      const userCollection = db.collection(process.env.MONGODB_USERCOLLECTION);
      userCollection
        .findOne({ email: req.session.userEmail })
        .then((user) => {
          if (user) {
            const userId = user._id;

            runPythonScript(serumCreatinine, ejectionFraction)
              .then((result) => {
                insertDataIntoMongoDB(
                  serumCreatinine,
                  ejectionFraction,
                  result,
                  userId,
                  patientId
                ).catch((error) => {
                  console.error("Error inserting data into MongoDB:", error);
                });

                res.render("result.ejs", {
                  result,
                  serumCreatinine,
                  ejectionFraction,
                });
              })
              .catch((error) => {
                console.error("Error executing Python script:", error);
                res.status(500).send("Internal Server Error");
              });
          } else {
            console.error("User not found");
            res.status(404).send("User not found");
          }
        })
        .catch((error) => {
          console.error("Error finding user:", error);
          res.status(500).send("Internal Server Error");
        })
        .finally(() => {
          client.close();
        });
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
      res.status(500).send("Internal Server Error");
    });
});

// Default 404 route for any unhandled routes
app.get("*", (req, res) => {
  res.status(404);
  res.render("404");
});

// Starts server on localhost:3000
app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
