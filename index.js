const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");

const server = require("./server");
const patient = require("./patient");

module.exports = app;

app.set("view engine", "ejs");

app.get("/add-patient", patient.renderAddPatients);
app.post("/add-patient", patient.addPatient);
app.get("/login", server.renderLogin);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
