const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const dotenv = require("dotenv");
const MongoDBSession = require("connect-mongodb-session")(session);
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

dotenv.config();

const server = require("./server");
const patient = require("./patient");

module.exports = app;

app.set("view engine", "ejs");

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;

const mongoStore = new MongoDBSession({
  uri: url,
  collection: "sessions",
});

// Use the session middleware (sessions expire after 1 hour)

const NODE_SESSION_SECRET = process.env.NODE_SESSION_SECRET;

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

app.get("/add-patient", patient.renderAddPatients);
app.post("/add-patient", patient.addPatient);

app.get("/", server.redirectToDashboardIfAuth, server.renderIndex);
app.get("/login", server.redirectToDashboardIfAuth, server.renderLogin);
app.get("/register", server.redirectToDashboardIfAuth, server.renderRegister);
app.get("/dashboard", server.isAuth, server.renderDashboard);
// app.get(
//   "/doctor-profile",
//   server.isAuth,
//   server.renderDoctorProfile,
//   server.currentUserInfo
// );
app.get("/doctor-profile", server.isAuth, server.currentUserInfo);

app.post("/register", server.processRegister);
app.post("/login", server.processLogin);
app.post("/logout", server.logout);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
