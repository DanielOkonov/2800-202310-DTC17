const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const Joi = require("joi");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useUnifiedTopology: true });

const patientSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  middleName: Joi.string().allow('', null),
  lastName: Joi.string().min(1).required(),
  personalHealthId: Joi.string().min(9).max(10).required(),
  dateOfBirth: Joi.date().iso().required(),
  sex: Joi.string().valid("male", "female", "other").required(),
  anaemia: Joi.boolean().required(),
  diabetes: Joi.boolean().required(),
  highBloodPressure: Joi.boolean().required(),
  // ejectionFraction: Joi.object({
  //   value: Joi.number().integer().min(0).required(),
  //   lastModifiedDate: Joi.date().required(),
  //   state: Joi.string().valid('profile created', 'data modified', 'last analysis').required()
  // }).required(),
  // serumCreatinine: Joi.object({
  //   value: Joi.number().precision(1).min(0.0).required(),
  //   lastModifiedDate: Joi.date().required(),
  //   state: Joi.string().valid('profile created', 'data modified', 'last analysis').required()
  // }).required(),
});

exports.renderAddPatients = function (req, res) {
  res.render("add-patient", { error: null });
};

exports.renderPatients = function (req, res) {
  res.render("patients");
};

exports.addPatient = async function (req, res) {
  console.log("req.body: " + JSON.stringify(req.body));

  // Convert anaemia, diabetes, and highBloodPressure fields to boolean
  req.body.anaemia = req.body.anaemia === 'on';
  req.body.diabetes = req.body.diabetes === 'on';
  req.body.highBloodPressure = req.body.highBloodPressure === 'on';

  try {
    await patientSchema.validateAsync(req.body);

    // Set avatarType based on sex
    let avatarType;
    switch (req.body.sex) {
      case 'male':
        avatarType = 'male';
        break;
      case 'female':
        avatarType = 'female';
        break;
      case 'other':
      default:
        avatarType = 'human';
        break;
    }

    const patientData = {
      firstName: req.body.firstName,
      middleName: req.body.middleName ? req.body.middleName : null,
      lastName: req.body.lastName,
      dateOfBirth: new Date(req.body.dateOfBirth),
      sex: req.body.sex,
      anaemia: req.body.anaemia,  // no need to convert again
      diabetes: req.body.diabetes,  // no need to convert again
      highBloodPressure: req.body.highBloodPressure,  // no need to convert again
      // ejectionFraction: {
      //   value: parseInt(req.body.ejectionFraction),
      //   lastModifiedDate: new Date(),
      //   state: 'profile created'
      // },
      // serumCreatinine: {
      //   value: parseFloat(req.body.serumCreatinine),
      //   lastModifiedDate: new Date(),
      //   state: 'profile created'
      // },
      // previous_analysis: [],
      avatar: `https://avatars.dicebear.com/api/${avatarType}/${req.body.firstName}.svg`,
    };



    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
    await patientsCollection.insertOne(patientData);

    console.log("Patient added successfully: ", patientData);

    // Send a success message to the view, also pass error as null
    res.render("add-patient", { success: "Patient added successfully", error: null });

  } catch (error) {
    console.error("Error saving patient:", error);
    if (error.isJoi) {
      res.status(400).render("add-patient", { error: error.details[0].message });
    } else {
      res.status(500).render("add-patient", { error: "Error saving patient" });
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
    res.render('patient-list', {
      patients: patients,
      currentPage: currentPage,
      totalPages: totalPages,
      itemsPerPage: itemsPerPage,
      query: req.query.q // The search query string
    });

  } catch (error) {
    console.error("Error getting patients:", error);
    res.status(500).send("Error getting patients");
  }
};

exports.searchPatients = async function (req, res) {
  try {
    // Function to escape special characters for use in a regular expression
    function escapeRegExp(string) {
      return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    const query = escapeRegExp(req.query.q);
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 10; // Default to 10 if not specified
    const currentPage = parseInt(req.query.page) || 1; // Default to page 1 if not specified

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);

    // Fetch the data based on the search query
    const patients = await patientsCollection
      .find({ name: new RegExp(query, 'i') })
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .toArray();

    // Fetch total count of patients for pagination
    const totalCount = await patientsCollection.countDocuments({ name: new RegExp(query, 'i') });

    // Calculate pagination variables
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // render the searchResults.ejs view and pass the patients data to it
    res.render('patient-search', {
      patients: patients,
      currentPage: currentPage,
      totalPages: totalPages,
      itemsPerPage: itemsPerPage,
      query: req.query.q // The search query string
    });

  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ error: "Error searching patients" });
  }
};

exports.getPatientProfile = async function (req, res) {
  let error = null;  // Initialize error as null
  try {
    const patientId = req.params.id;

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);

    const patient = await patientsCollection.findOne({ _id: new ObjectId(patientId) });

    if (patient) {
      res.render('patient-profile', { patient: patient, error: error });
    } else {
      throw new Error('Patient not found');
    }

  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.render('patient-profile', { error: error.message });
  }
};





