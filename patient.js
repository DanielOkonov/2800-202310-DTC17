require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const Joi = require("joi");

const app = express();
const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const dbName = process.env.MONGODB_DATABASE;
const client = new MongoClient(url, { useUnifiedTopology: true });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

const patientSchema = Joi.object({
  name: Joi.string().min(1).required(),
  age: Joi.number().min(1).required(),
  sex: Joi.string().valid("male", "female", "other").required(),
});

app.get("/add-patient", (req, res) => {
  res.render("add-patient");
});

app.post("/add-patient", async (req, res) => {
  const { error } = patientSchema.validate(req.body);

  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  await client.connect();

  const db = client.db(dbName);
  const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
  const age = parseInt(req.body.age);

  const patientData = {
    respectiveDoctorId: req.body.respectiveDoctorId,
    name: req.body.name,
    age: age,
    sex: req.body.sex,
    previous_analysis: [],
  };

  await patientsCollection.insertOne(patientData);

  res.send("Patient added successfully");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
