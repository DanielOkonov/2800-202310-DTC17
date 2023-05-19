const axios = require("axios").default;
const { JSDOM } = require("jsdom");
const { document } = new JSDOM("");
global.document = document;

const MongoClient = require("mongodb").MongoClient;
const faker = require("faker");
require("dotenv").config();

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useUnifiedTopology: true });

async function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

async function createDummyPatients(loggedInUsername) {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(process.env.MONGODB_DATABASE);
        console.log("Using database:", process.env.MONGODB_DATABASE);

        const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
        console.log("Using collection:", process.env.MONGODB_COLLECTION);

        for (let i = 0; i < 30; i++) {
            // Generate random patient data
            const firstName = faker.name.firstName();
            const middleName = faker.name.firstName();
            const lastName = faker.name.lastName();
            const personalHealthId = faker.random.number({ min: 100000000, max: 999999999 });
            const dateOfBirth = faker.date.between(
                faker.date.past(65),
                faker.date.past(18)
            );
            const age = await calculateAge(dateOfBirth);
            const sex = faker.random.arrayElement(["male", "female", "other"]);
            const anaemia = faker.datatype.boolean();
            const diabetes = faker.datatype.boolean();
            const highBloodPressure = faker.datatype.boolean();

            // Generate a random number of analysis entries (between 0 and 5)
            const analysisCount = faker.datatype.number({ min: 0, max: 5 });
            const analysis = [];

            for (let j = 0; j < analysisCount; j++) {
                const analysisEntry = {
                    analysisDate: faker.date.past(),
                    conductedBy: loggedInUsername,
                    ejectionFraction: faker.datatype.number({ min: 14, max: 80 }),
                    serumCreatinine: faker.datatype.number({ min: 0.5, max: 9.4, precision: 0.1 }),
                    analysisResult: faker.datatype.number({ min: 0, max: 100 }),
                };
                analysis.push(analysisEntry);
            }

            // Set avatarType based on sex
            let avatarType;
            switch (sex) {
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

            // Retrieve avatar from API
            const avatarResponse = await axios.get(`https://avatars.dicebear.com/api/${avatarType}/${firstName}.svg`);
            const avatar = avatarResponse.request.res.responseUrl;

            // Create the patient data object
            const patientData = {
                firstName,
                middleName,
                lastName,
                personalHealthId,
                dateOfBirth,
                age,
                sex,
                anaemia,
                diabetes,
                highBloodPressure,
                analysis,
                avatar,
                username: loggedInUsername, // Add the username property
            };

            // Insert the patient data into the collection
            await patientsCollection.insertOne(patientData);
            console.log("Patient added successfully:", patientData);
        }

        // Close the MongoDB connection
        await client.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error creating dummy patients:", error);
    }
}

module.exports = {
    createDummyPatients,
};

