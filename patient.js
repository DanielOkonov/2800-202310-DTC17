const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const Joi = require("joi");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useUnifiedTopology: true });

const patientSchema = Joi.object({
  name: Joi.string().min(1).required(),
  age: Joi.number().integer().min(1).required(),
  sex: Joi.string().valid("male", "female", "other").required(),
});

app.get("/add-patient", (req, res) => {
  res.render("add-patient");
});

app.post("/add-patient", async (req, res) => {
  try {
    await patientSchema.validateAsync(req.body);

    const patientData = {
      name: req.body.name,
      age: parseInt(req.body.age),
      sex: req.body.sex,
      previous_analysis: [],
    };

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
    await patientsCollection.insertOne(patientData);

    console.log("Patient added successfully: ", patientData);

    res.send("Patient added successfully");
  } catch (error) {
    if (error.isJoi) {
      res.status(400).send(error.details[0].message);
    } else {
      console.error("Error saving patient:", error);
      res.status(500).send("Error saving patient");
    }
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
