const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');

/* Setup dotenv to load environment variables from .env file */
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, './../../../config', '.env');
dotenv.config({ path: envPath });
/* dotenv setup completed */

/* Define the MongoDB connection string */
const uri = process.env.MONGODB_URI;

/* Create a new MongoClient instance with the specified connection string and options */
const client = new MongoClient(uri, {
 serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
 }
});

/* Function to import user data into the database, setting calendar_url to null by default */
async function importUserData(login, password) {
 try {
    await client.connect();
    console.log("Connected to MongoDB!");

    /* Select the 'users' collection from the 'EntMini' database */
    const collection = client.db("EntMini").collection("users");

    /* Hash the password using bcrypt */
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password", hashedPassword);

    /* Insert a new document into the 'users' collection with the provided login, hashed password, and a null calendar_url */
    await collection.insertOne({ login, password: hashedPassword, calendar_url: null });

    console.log("Data imported successfully!");
 } finally {
    await client.close();
 }
}

/* Function to update the calendar URL for a user in the database */
async function updateCalendar(login, calendarUrl) {
 try {
    await client.connect();
    console.log("Connected to MongoDB!");

    /* Select the 'users' collection from the 'EntMini' database */
    const collection = client.db("EntMini").collection("users");

    /* Update the 'calendar_url' field for the user with the specified login */
    await collection.updateOne({ login }, { $set: { calendar_url: calendarUrl } });

    console.log("Calendar URL updated successfully!");
 } finally {
    await client.close();
 }
}

/* Function to check if a login and password match an existing user in the database */
async function check_logins(login, password) {
 try {
    await client.connect();
    console.log("Connected to MongoDB!");

    /* Select the 'users' collection from the 'EntMini' database */
    const collection = client.db("EntMini").collection("users");

    /* Find a user document with the specified login */
    const user = await collection.findOne({ login });

    if (user) {
      /* Compare the provided password with the stored hashed password */
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        console.log("Login and password are correct!");
        return true;
      } else {
        console.log("Password is incorrect!");
        return false;
      }
    } else {
      console.log("Login not found!");
      return false;
    }
 } finally {
    await client.close();
 }
}

/* Export the functions for use in other modules */
module.exports = { importUserData, updateCalendar, check_logins };
