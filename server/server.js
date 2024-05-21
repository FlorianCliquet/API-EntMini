const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const fsPromises = require('fs').promises;
const usecalendarurl = require('./src/api_functions/webscrapping/usecalendarurl.js');
const parseICS = require('./src/api_functions/webscrapping/parse_ics.js');
const getcalendar = require('./src/api_functions/webscrapping/getcalendarurl.js');
const validlogin = require('./src/api_functions/webscrapping/valid_login_username.js');
const { importUserData, updateCalendar, check_logins } = require('./src/api_functions/db/mongodb.js');
const { RenewJSON } = require('./src/auto_update_functions/db/mongodb.js');
const cron = require('node-cron');
const processPlanningsData = require('./src/auto_update_functions/location/loadlocationcalendar.js');
const busytimes = require('./src/auto_update_functions/location/busytimes.js');
const freeslotcalendar = require('./src/auto_update_functions/location/freeslotcalendar.js');
const deep_merge = require('deepmerge');

/*BEAULIEU*/
const url_beaulieu = ["https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/V3LDV23A.shu", "BEAULIEU"];
/*BEAULIEU*/

/* app.use is a method inbuilt in express to recognize the incoming Request Object as a JSON Object.*/
app.use(bodyParser.json());

/* In-memory storage for every_slot data */
let everySlotData = [];

/* Schedule RenewJSON to run at 2 AM Paris time (UTC +2) */
cron.schedule('0 2 * * *', async () => {
  console.log('Running RenewJSON at 2 AM Paris time...');
  await RenewJSON();
  await updateEverySlotData();
});

/* Update the in-memory everySlotData */
async function updateEverySlotData() {
  try {
    console.log("Processing plannings data...");
    await processPlanningsData(url_beaulieu);
    console.log("Data processed successfully!");

    // Read and process all files in the directory
    const files = await fsPromises.readdir('./src/out/BEAULIEU');
    everySlotData = [];

    // Loop through files to extract building name and busy times
    for (const file of files) {
      console.log("file", file);
      const buildingName = file.replace(/\.json$/, "");
      console.log("buildingName", buildingName);
      if (buildingName) {
        const formattedBuildingName = `${buildingName}`;
        const filePath = path.join('./src/out/BEAULIEU', file);
        const slot = await busytimes(filePath);
        everySlotData.push({ [formattedBuildingName]: slot });
      }
    }
  } catch (error) {
    console.error("Error processing planning data:", error);
  }
}

/* app.post('/api') is used to get the asset for the calendar of the user. */
app.post('/api', async (req, res) => {
  console.log(req.body);
  const login = req.body.login;
  const asset = await readJSONFileForLogin('./src/assets', login);
  res.json(asset);
});

/* app.post('/api/calendar') is used to send data to the server to create/update calendar asset. */
app.post('/api/calendar', async (req, res) => {
  const login = req.body.login;
  const password = req.body.password;
  console.log("Attempting to get calendar...");
  console.log("login", login);
  const url = 'https://ent.univ-rennes1.fr/f/welcome/normal/render.uP';
  const exporturl = await getcalendar(url, login, password);
  await updateCalendar(login, exporturl);
  console.log("Try to use calendar url");
  const filename = await usecalendarurl(exporturl, login);
  console.log("Try to parse ICS");
  const isValid = await parseICS(filename, login);
  if (isValid) {
    res.json({ isValid: true });
  } else {
    res.status(401).json({ isValid: false });
  }
});

/* app.post('/api/db/check_logins') is used to send data to the server and check if they're stored in the db */
app.post('/api/db/check_logins', async (req, res) => {
  const { login, password } = req.body;
  const isValid = await check_logins(login, password);
  if (isValid) {
    res.json({ isValid: true });
  } else {
    res.status(401).json({ isValid: false });
  }
});

/* app.post('/api/db/add_logins') is used to send data to the server and store them in the db */
app.post('/api/db/add_logins', async (req, res) => {
  const { login, password } = req.body;
  const isValid = await importUserData(login, password);
  console.log(isValid);
  if (isValid) {
    res.json({ isValid: true });
  } else {
    res.status(401).json({ isValid: false });
  }
});

/* app.post('/clear-json') is used to clear the JSON file, was created for debugging */
app.post('/clear-json', async (req, res) => {
  try {
    await fsPromises.writeFile('./src/assets/fcliquetADE.json', '[]');
    res.sendStatus(200);
  } catch (error) {
    console.error('Error clearing JSON file:', error);
    res.sendStatus(500);
  }
});

/* app.post('/parse-ics') is used to parse the ICS file */
app.post('/parse-ics', async (req, res) => {
  try {
    res.sendStatus(200);
  } catch (error) {
    console.error('Error parsing ICS file:', error);
    res.sendStatus(500);
  }
});

/* app.post('/api/verify') is used to verify the credentials with webscrapping */
app.post('/api/verify', async (req, res) => {
  console.log("Attempting to verify credentials...");
  const { login, password } = req.body;
  const isValid = await validlogin(login, password);
  if (isValid) {
    res.json({ isValid: true });
  } else {
    res.status(401).json({ isValid: false });
  }
});

/* readJSONFileForLogin is used to read the {login}ADE.json to help for the app.post('/api') */
async function readJSONFileForLogin(directory, login) {
  const currentDirectory = __dirname;
  const filename = `${login}ADE.json`;

  const filePath = path.join(currentDirectory, directory, filename);

  try {
    const fileContent = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading JSON file for login ${login}:`, error);
    throw error;
  }
}

app.get('/api/salleslibres', async (req, res) => {
    try {
      const currentDate = new Date();
      const currentHour = currentDate.getHours();
  
      // Check if it's 2 AM Paris time
      const is2AMParisTime = currentHour === 2;
      let freeSlots;
      if (is2AMParisTime) {
            // Update everySlotData and process free slots only if it's 2 AM Paris time
        await updateEverySlotData();
        freeSlots = await freeslotcalendar(everySlotData);
      } else {
        // Read the existing file if it's not 2 AM Paris time
        const existingData = await fsPromises.readFile('./src/out/formatted_events.json', 'utf8');
        freeSlots = JSON.parse(existingData);
      }
  
      // Send the free slots data as the response
      res.json(freeSlots);
    } catch (error) {
      console.error("Error processing salleslibres:", error);
      res.status(500).json({ error: "An error occurred while processing salleslibres." });
    }
  });
  

/* app.listen is used to listen to the port 5000 */
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
