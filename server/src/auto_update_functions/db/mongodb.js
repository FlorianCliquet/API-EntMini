const { MongoClient, ServerApiVersion } = require('mongodb');
const usecalendarurl = require('./../../api_functions/webscrapping/usecalendarurl');
const parseICS = require('./../../api_functions/webscrapping/parse_ics');
/* dotenv setup */
const dotenv = require('dotenv');
const path = require('path');
const envPath = path.resolve(__dirname, './../../../config', '.env');
dotenv.config({ path: envPath });
/* dotenv setup */

/* uri is the connection string to the MongoDB database.*/
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

/* Function to get every user's calendar url to renew the json by parsing them again*/
async function RenewJSON() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        const collection = client.db("EntMini").collection("users");
        const cursor = collection.find();
        const users = await cursor.toArray();
        for (const user of users) {
            /* If the calendar url is null, drop the collection for the login */
            if (user.calendar_url == null) {
                console.log("No calendar url for ", user.login);
                await collection.deleteMany({ login: user.login });
                console.log("Collection dropped for ", user.login);
            } else {
                const login = user.login;
                console.log("Renewing JSON for ", login);
                const calendarUrl = user.calendar_url;
                console.log("Try to use calendar url");
                const filename = await usecalendarurl(calendarUrl, login);
                console.log("Try to parse ICS");
                const isValid = await parseICS(filename, login);
                if (isValid) {
                    console.log("Calendar updated for ", login);
                } else {
                    console.log("Calendar not updated for ", login);
                }
            }
        }
    } finally {
        await client.close();
    }
}

module.exports = { RenewJSON };
