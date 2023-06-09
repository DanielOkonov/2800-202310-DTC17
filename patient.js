const axios = require("axios").default;
const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const Joi = require("joi");
const faker = require("faker");
const { timeStamp } = require("console");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useUnifiedTopology: true });

const patientSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  middleName: Joi.string().allow("", null),
  lastName: Joi.string().min(1).required(),
  personalHealthId: Joi.string().min(9).max(10).required(),
  dateOfBirth: Joi.date().iso().required(),
  age: Joi.number().integer().min(0).required(),
  sex: Joi.string().valid("male", "female", "other").required(),
  anaemia: Joi.boolean().required(),
  diabetes: Joi.boolean().required(),
  highBloodPressure: Joi.boolean().required(),
  avatar: Joi.string().uri().required(), // New line
  analysis: Joi.array()
    .items(
      Joi.object({
        analysisDate: Joi.date().iso().required(),
        conductedBy: Joi.string().required(),
        ejectionFraction: Joi.number().integer().min(0).max(100).required(),
        serumCreatinine: Joi.number().precision(1).min(0).required(),
        analysisResult: Joi.number().integer().min(0).max(100).required(),
      })
    )
    .optional(),
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
  req.body.anaemia = req.body.anaemia === "on";
  req.body.diabetes = req.body.diabetes === "on";
  req.body.highBloodPressure = req.body.highBloodPressure === "on";

  try {
    // Calculate the age from the date of birth
    const dateOfBirth = new Date(req.body.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    // Set avatarType based on sex
    let avatarType;
    switch (req.body.sex) {
      case "male":
        avatarType = "male";
        break;
      case "female":
        avatarType = "female";
        break;
      case "other":
      default:
        avatarType = "human";
        break;
    }

    const patientData = {
      firstName: req.body.firstName,
      middleName: req.body.middleName ? req.body.middleName : null,
      lastName: req.body.lastName,
      personalHealthId: req.body.personalHealthId,
      dateOfBirth: dateOfBirth.toISOString(),
      age: age,
      sex: req.body.sex,
      anaemia: req.body.anaemia,
      diabetes: req.body.diabetes,
      highBloodPressure: req.body.highBloodPressure,
      analysis: req.body.analysis || [],
      avatar: `https://avatars.dicebear.com/api/${avatarType}/${req.body.firstName}.svg`,
    };
    await patientSchema.validateAsync(patientData);

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
    await patientsCollection.insertOne(patientData);

    console.log("Patient added successfully: ", patientData);

    // Send a success message to the view, also pass error as null
    res.render("add-patient", {
      success: "Patient added successfully",
      error: null,
    });
  } catch (error) {
    console.error("Error saving patient:", error);
    if (error.isJoi) {
      res
        .status(400)
        .render("add-patient", { error: error.details[0].message });
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
    const sortField = req.query.sort || "lastName"; // defaults to "lastName" if not specified
    const sortOrder = req.query.order === "desc" ? -1 : 1; // defaults to ascending order

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

    // Define sort option
    const sortOption = {};
    sortOption[sortField] = sortOrder;

    // Fetch the data for the current page
    const patients = await patientsCollection
      .find()
      .sort(sortOption)
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .toArray();

    // render the patients.ejs view and pass the patients data to it
    res.render("patient-list", {
      patients: patients,
      currentPage: currentPage,
      totalPages: totalPages,
      itemsPerPage: itemsPerPage,
      path: "/patient-list",
      query: req.query.q, // The search query string
      sort: sortField, // The field to sort by
      order: req.query.order, // The sort order
    });
  } catch (error) {
    console.error("Error getting patients:", error);
    res.status(500).send("Error getting patients");
  }
};

exports.searchPatients = async function (req, res) {
  try {
    // Check if the request query parameter is null or empty
    if (!req.query.q || req.query.q.trim() === "") {
      return exports.getPatients(req, res);
    }

    const query = req.query.q;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 10; // Default to 10 if not specified
    const currentPage = parseInt(req.query.page) || 1; // Default to page 1 if not specified

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);

    // Split the query into words
    const words = query.split(" ").filter((word) => word.length > 1); // Ignore single letters

    // Update the search query to match firstName, middleName, or lastName
    const searchQuery = {
      $and: words.map((word) => ({
        $or: [
          { firstName: { $regex: `.*${word}.*`, $options: "i" } },
          { middleName: { $regex: `.*${word}.*`, $options: "i" } },
          { lastName: { $regex: `.*${word}.*`, $options: "i" } },
        ],
      })),
    };

    // Fetch the data based on the search query
    const patients = await patientsCollection
      .find(searchQuery)
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .toArray();

    // Fetch total count of patients for pagination
    const totalCount = await patientsCollection.countDocuments(searchQuery);

    // Calculate pagination variables
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // render the searchResults.ejs view and pass the patients data to it
    res.render("patient-search", {
      patients: patients,
      currentPage: currentPage,
      totalPages: totalPages,
      itemsPerPage: itemsPerPage,
      query: req.query.q, // The search query string
      path: "/search", // Add this line
    });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ error: "Error searching patients" });
  }
};

exports.getPatientProfile = async function (req, res) {
  try {
    const patientId = req.params.id;
    console.log("Fetching patient with ID:", patientId);

    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(process.env.MONGODB_DATABASE);
    console.log("Using database:", process.env.MONGODB_DATABASE);

    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
    console.log("Using collection:", process.env.MONGODB_COLLECTION);

    const patient = await patientsCollection.findOne({
      _id: new ObjectId(patientId),
    });

    if (patient) {
      console.log("Found patient:", patient);
      res.render("patient-profile", { patient: patient, error: null });
    } else {
      console.log("Patient not found");
      res.status(404).render("404", { error: "Patient not found" });
    }
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    if (error instanceof TypeError) {
      // this will catch errors when trying to convert invalid strings to ObjectId
      res.status(400).render("error", { error: "Invalid patient ID" });
    } else {
      res.status(500).render("error", { error: error.message });
    }
  }
};

exports.getAnalysisResult = async function (req, res) {
  const patientId = req.params.patientId;
  const analysisId = parseInt(req.params.analysisId);

  console.log(
    `Fetching analysis result for patient with ID ${patientId} and analysisId ${analysisId}`
  );

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(process.env.MONGODB_DATABASE);
    console.log("Using database:", process.env.MONGODB_DATABASE);

    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
    console.log("Using collection:", process.env.MONGODB_COLLECTION);

    const patient = await patientsCollection.findOne({
      _id: new ObjectId(patientId),
    });

    if (patient) {
      console.log("Found patient:", patient);
    } else {
      console.log("Patient for analysis result not found");
      res
        .status(404)
        .render("404", { error: "Patient for analysis result not found" });
    }

    const analysisResult = patient.analysis[analysisId];

    if (analysisResult) {
      console.log("Found analysisResult:", analysisResult);
      res.render("analysis-result", { result: analysisResult, error: null });
    } else {
      console.log("analysisResult not found");
      res.status(404).render("404", { error: "analysisResult not found" });
    }
  } catch (error) {
    console.error("Error fetching patient analysis result:", error);
    if (error instanceof TypeError) {
      // this will catch errors when trying to convert invalid strings to ObjectId
      res.status(400).render("error", { error: "Invalid patient ID" });
    } else {
      res.status(500).render("error", { error: error.message });
    }
  }
};

exports.getPatientRiskHistory = async function (req, res) {
  try {
    const patientId = req.params.id;
    console.log("Fetching patient with ID:", patientId);

    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(process.env.MONGODB_DATABASE);
    console.log("Using database:", process.env.MONGODB_DATABASE);

    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
    console.log("Using collection:", process.env.MONGODB_COLLECTION);

    const patient = await patientsCollection.findOne({
      _id: new ObjectId(patientId),
    });

    if (patient) {
      console.log("Found patient:", patient);

      const xyValues = patient.analysis.map((analysis) => ({
        x: analysis.analysisDate,
        y: analysis.analysisResult,
      }));

      res.render("patient-risk-history", { data: JSON.stringify(xyValues) });
    } else {
      console.log("Patient not found");
      res.status(404).render("404", { error: "Patient not found" });
    }
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    if (error instanceof TypeError) {
      // this will catch errors when trying to convert invalid strings to ObjectId
      res.status(400).render("error", { error: "Invalid patient ID" });
    } else {
      res.status(500).render("error", { error: error.message });
    }
  }
};

exports.liveSearchPatients = async function (req, res) {
  try {
    if (!req.query.q || req.query.q.trim() === "") {
      return res.json({ patients: [] });
    }

    function escapeRegExp(string) {
      return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
    }

    const query = escapeRegExp(req.query.q);

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);

    const searchQuery = {
      $or: [
        { firstName: new RegExp(query, "i") },
        { middleName: new RegExp(query, "i") },
        { lastName: new RegExp(query, "i") },
      ],
    };

    const patients = await patientsCollection
      .find(searchQuery)
      .limit(10)
      .toArray();

    res.json({ patients: patients });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ error: "Error searching patients" });
  }
};
