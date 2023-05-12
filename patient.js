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

exports.renderAddPatients = function (req, res) {
  res.render("add-patient");
};

exports.renderPatients = function (req, res) {
  res.render("patients");
};

exports.addPatient = async function (req, res) {
  console.log("req.body: " + JSON.stringify(req.body));
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
};

exports.getPatients = async function (req, res) {
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);

    const itemsPerPage = parseInt(req.query.itemsPerPage) || 10; // defaults to 10 if not specified
    const currentPage = parseInt(req.query.page) || 1; // defaults to 1 if not specified

    // Validate itemsPerPage
    if (![10, 25, 50].includes(itemsPerPage)) {
      return res.status(400).send("Invalid number of items per page");
    }

    // Count the total number of patients
    const totalPatients = await patientsCollection.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalPatients / itemsPerPage);

    // Validate currentPage
    if (currentPage < 1 || currentPage > totalPages) {
      return res.status(400).send("Invalid page number");
    }

    // Fetch the data for the current page
    const patients = await patientsCollection
      .find()
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .toArray();

    // render the patients.ejs view and pass the patients data to it
    res.render('patients', {
      patients: patients,
      currentPage: currentPage,
      totalPages: totalPages,
      itemsPerPage: itemsPerPage
    });
  } catch (error) {
    console.error("Error getting patients:", error);
    res.status(500).send("Error getting patients");
  }
};
