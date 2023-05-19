const { MongoClient } = require("mongodb");
require("dotenv").config();

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/?retryWrites=true&w=majority`;
const client = new MongoClient(url, { useUnifiedTopology: true });

// Function to delete all patient entries
async function deleteAllPatients() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        const db = client.db(process.env.MONGODB_DATABASE);
        console.log("Using database:", process.env.MONGODB_DATABASE);

        const patientsCollection = db.collection(process.env.MONGODB_COLLECTION);
        console.log("Using collection:", process.env.MONGODB_COLLECTION);

        await patientsCollection.deleteMany({});

        console.log("All patient entries deleted successfully");

        // Close the MongoDB connection
        await client.close();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error deleting patient entries:", error);
    }
}

module.exports = {
    deleteAllPatients: deleteAllPatients
};