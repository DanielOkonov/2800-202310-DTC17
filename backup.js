const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
const Joi = require("joi");
require("dotenv").config();
const moment = require("moment");
const faker = require("faker");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useUnifiedTopology: true });

// const patientSchema = Joi.object({
//   name: Joi.string().min(1).required(),
//   age: Joi.number().integer().min(1).required(),
//   sex: Joi.string().valid("male", "female", "other").required(),
// });

const patientSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  middleName: Joi.string().allow(null),
  lastName: Joi.string().min(1).required(),
  personalHealthId: Joi.string().min(9).max(10).required(),
  dateOfBirth: Joi.date().iso().required(),
  sex: Joi.string().valid("male", "female", "other").required(),
  anaemia: Joi.object({
    value: Joi.number().integer().min(0).max(1).required(),
    lastModifiedDate: Joi.date().required(),
    state: Joi.string()
      .valid("profile created", "data modified", "last analysis")
      .required(),
  }).required(),
  creatininePhosphokinase: Joi.object({
    value: Joi.number().integer().min(0).required(),
    lastModifiedDate: Joi.date().required(),
    state: Joi.string()
      .valid("profile created", "data modified", "last analysis")
      .required(),
  }).required(),
  diabetes: Joi.object({
    value: Joi.number().integer().min(0).max(1).required(),
    lastModifiedDate: Joi.date().required(),
    state: Joi.string()
      .valid("profile created", "data modified", "last analysis")
      .required(),
  }).required(),
  ejectionFraction: Joi.object({
    value: Joi.number().integer().min(0).required(),
    lastModifiedDate: Joi.date().required(),
    state: Joi.string()
      .valid("profile created", "data modified", "last analysis")
      .required(),
  }).required(),
  highBloodPressure: Joi.object({
    value: Joi.number().integer().min(0).max(1).required(),
    lastModifiedDate: Joi.date().required(),
    state: Joi.string()
      .valid("profile created", "data modified", "last analysis")
      .required(),
  }).required(),
  platelets: Joi.object({
    value: Joi.number().integer().min(0).required(),
    lastModifiedDate: Joi.date().required(),
    state: Joi.string()
      .valid("profile created", "data modified", "last analysis")
      .required(),
  }).required(),
  serumCreatinine: Joi.object({
    value: Joi.number().precision(1).min(0.0).required(),
    lastModifiedDate: Joi.date().required(),
    state: Joi.string()
      .valid("profile created", "data modified", "last analysis")
      .required(),
  }).required(),
  serumSodium: Joi.object({
    value: Joi.number().integer().min(0).required(),
    lastModifiedDate: Joi.date().required(),
    state: Joi.string()
      .valid("profile created", "data modified", "last analysis")
      .required(),
  }).required(),
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

    // const patientData = {
    //   name: req.body.name,
    //   age: parseInt(req.body.age),
    //   sex: req.body.sex,
    //   previous_analysis: [],
    //   avatar: `https://avatars.dicebear.com/api/${avatarType}/${req.body.name}.svg`,
    // };

    const patientData = {
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      personalHealthId: req.body.personalHealthId,
      age: parseInt(req.body.age),
      anaemia: parseInt(req.body.anaemia),
      creatininePhosphokinase: parseInt(req.body.creatininePhosphokinase),
      diabetes: parseInt(req.body.diabetes),
      ejectionFraction: parseInt(req.body.ejectionFraction),
      highBloodPressure: parseInt(req.body.highBloodPressure),
      platelets: parseInt(req.body.platelets),
      serumCreatinine: parseFloat(req.body.serumCreatinine),
      serumSodium: parseInt(req.body.serumSodium),
      sex: req.body.sex,
      previous_analysis: [],
      avatar: `https://avatars.dicebear.com/api/${avatarType}/${req.body.firstName}.svg`,
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
    res.render("patient-list", {
      patients: patients,
      currentPage: currentPage,
      totalPages: totalPages,
      itemsPerPage: itemsPerPage,
      query: req.query.q, // The search query string
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
      return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
    }

    const query = escapeRegExp(req.query.q);
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 10; // Default to 10 if not specified
    const currentPage = parseInt(req.query.page) || 1; // Default to page 1 if not specified

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);

    // Fetch the data based on the search query
    const patients = await patientsCollection
      .find({
        $or: [
          { firstName: new RegExp(query, "i") },
          { middleName: new RegExp(query, "i") },
          { lastName: new RegExp(query, "i") },
        ],
      })
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .toArray();

    // Fetch total count of patients for pagination
    const totalCount = await patientsCollection.countDocuments({
      $or: [
        { firstName: new RegExp(query, "i") },
        { middleName: new RegExp(query, "i") },
        { lastName: new RegExp(query, "i") },
      ],
    });

    // Calculate pagination variables
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // render the searchResults.ejs view and pass the patients data to it
    res.render("patient-search", {
      patients: patients,
      currentPage: currentPage,
      totalPages: totalPages,
      itemsPerPage: itemsPerPage,
      query: req.query.q, // The search query string
    });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ error: "Error searching patients" });
  }
};

exports.getPatientProfile = async function (req, res) {
  let error = null; // Initialize error as null
  try {
    const patientId = req.params.id;

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);

    const patient = await patientsCollection.findOne({
      _id: new ObjectId(patientId),
    });

    if (patient) {
      res.render("patient-profile", { patient: patient, error: error });
    } else {
      throw new Error("Patient not found");
    }
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    res.render("patient-profile", { error: error.message });
  }
};

// exports.addAvatarsToExistingPatients = async function (req, res) {
//   try {
//     await client.connect();
//     const db = client.db(process.env.MONGODB_DATABASE);
//     const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);

//     // Fetch all patients
//     const patients = await patientsCollection.find().toArray();

//     for (let patient of patients) {
//       // Set avatarType based on sex
//       let avatarType;
//       switch (patient.sex) {
//         case 'male':
//           avatarType = 'male';
//           break;
//         case 'female':
//           avatarType = 'female';
//           break;
//         case 'other':
//         default:
//           avatarType = 'human';
//           break;
//       }

//       // Generate avatar URL
//       const avatar = `https://avatars.dicebear.com/api/${avatarType}/${patient.name}.svg`;

//       // Update patient in the database
//       await patientsCollection.updateOne(
//         { _id: patient._id },
//         { $set: { avatar: avatar } }
//       );
//     }

//     console.log("Avatars added successfully to all patients");

//     res.send("Avatars added successfully to all patients");
//   } catch (error) {
//     console.error("Error adding avatars to patients:", error);
//     res.status(500).send("Error adding avatars to patients");
//   }
// };

exports.updatePatients = async function (req, res) {
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);

    // Define the data for the patients
    const patientsData = [
      {
        _id: "645bf0584a24afb8fa2244a6",
        firstName: "Bert",
        middleName: null,
        lastName: "Johnson",
        personalHealthId: "123456789",
        age: 65,
        anaemia: 1,
        creatininePhosphokinase: 582,
        diabetes: 0,
        ejectionFraction: 20,
        highBloodPressure: 1,
        platelets: 265000,
        serumCreatinine: 1.9,
        serumSodium: 130,
        sex: "male",
        avatar: "https://avatars.dicebear.com/api/male/Bert.svg",
      },
      // Add the rest of the patient data here...
    ];

    for (let patientData of patientsData) {
      // Update the patient data
      await patientsCollection.updateOne(
        { _id: new ObjectId(patientData._id) },
        { $set: patientData },
        { upsert: true } // This will create a new document if one does not exist
      );
    }

    res.status(200).json({ message: "Patients data updated successfully" });
  } catch (error) {
    console.error("Error updating patients:", error);
    res.status(500).json({ error: "Error updating patients" });
  }
};

exports.generatePatients = async function (req, res) {
  try {
    const patients = [];
    for (let i = 0; i < 30; i++) {
      const gender = faker.random.arrayElement(["male", "female", "other"]);
      let avatarType;
      switch (gender) {
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
      const firstName = faker.name.firstName();
      const patient = {
        firstName: firstName,
        middleName: faker.random.arrayElement([faker.name.middleName(), null]),
        lastName: faker.name.lastName(),
        personalHealthId: faker.random
          .number({ min: 000000000, max: 9999999999 })
          .toString(),
        age: faker.random.number({ min: 40, max: 95 }),
        anaemia: faker.random.number({ min: 0, max: 1 }),
        creatininePhosphokinase: faker.random.number({ min: 23, max: 7861 }),
        diabetes: faker.random.number({ min: 0, max: 1 }),
        ejectionFraction: faker.random.number({ min: 14, max: 80 }),
        highBloodPressure: faker.random.number({ min: 0, max: 1 }),
        platelets: faker.random.number({ min: 25100, max: 850000 }),
        serumCreatinine: parseFloat(faker.finance.amount(0.5, 9.4, 1)),
        serumSodium: faker.random.number({ min: 113, max: 148 }),
        sex: gender,
        previous_analysis: [],
        avatar: `https://avatars.dicebear.com/api/${avatarType}/${firstName}.svg`,
      };
      patients.push(patient);
    }

    await client.connect();
    const db = client.db(process.env.MONGODB_DATABASE);
    const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
    await patientsCollection.insertMany(patients);

    res.status(200).json({ message: "Patients generated successfully" });
  } catch (error) {
    console.error("Error generating patients:", error);
    res.status(500).json({ error: "Error generating patients" });
  }
};

class Patient {
  constructor(dateOfBirth) {
    this.dateOfBirth = dateOfBirth;
  }

  getAge() {
    return moment().diff(this.dateOfBirth, "years");
  }
}

module.exports = Patient;
