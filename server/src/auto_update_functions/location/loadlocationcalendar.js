const path = require('path');
const axios = require('axios');
const fs = require('fs').promises;

// Function to convert datetime string to timestamp in Paris time zone
function toTimestamp(char) {
    const year = parseInt(char.slice(0, 4));
    const month = parseInt(char.slice(4, 6));
    const day = parseInt(char.slice(6, 8));
    const hour = parseInt(char.slice(9, 11));
    const minute = parseInt(char.slice(11, 13));
    const sec = parseInt(char.slice(13, 15));

    // Create date object in UTC
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, sec));

    // Adjust the date to Paris time zone (UTC+2)
    const parisTime = new Date(utcDate.getTime());

    return Math.floor(parisTime.getTime() / 1000);
}

// Function to format location key
function formatKey(key) {
    try {
        const regexList = [
            /^([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)\s*-\s*((?:[A-Za-z]?[-0-9]+)|(?:[A-Za-zÀ-ÿ ]*))/,
            /^([A-Za-z0-9]+)-([A-Za-z0-9]+)/,
            /^(.*)/
        ];

        for (const regex of regexList) {
            const matches = regex.exec(key);
            if (matches !== null) {
                let [bat, salle] = matches.slice(1);
                if (salle === undefined) {
                    salle = bat;
                    bat = "Others";
                }

                let code = "Salle";

                if (salle.startsWith("Hall ")) {
                    code = "Hall";
                    salle = salle.replace("Hall ", "").toLowerCase();
                } else if (salle.startsWith("Amphi ")) {
                    code = "Amphi";
                    salle = salle.replace("Amphi ", "").toLowerCase();
                }

                salle = salle.split(" ").filter(k => k !== "").join("_");

                // Adjusted format for filename compatibility
                return `${bat}-${code}-${salle}`;
            }
        }

        console.log("Invalid key format:", key);
        return "unknown_building";
    } catch (error) {
        console.error(error.message);
        return "unknown_building";
    }
}

// Function to fetch data and process it
async function processPlanningsData(url_table) {
    const url = url_table[0];
    const name = url_table[1];
    console.log(`Processing data for ${name}...`)
    try {
        // Fetch data
        console.log("Fetching data...")
        const response = await axios.get(url);
        if (response.status !== 200) throw new Error("Failed to fetch data");

        const text = response.data.replace(/\r/g, "").replace(/\n /g, "").split("\n");

        const liste = {};

        let DTSTART = "";
        let DTEND = "";
        let SUMMARY = "";
        let LOCATIONS = "";

        console.log("Processing data...")
        for (const item of text) {
            const [code, ...values] = item.split(":");
            const value = values.join(":");

            if (code === "DTSTART") {
                DTSTART = toTimestamp(value);
            } else if (code === "DTEND") {
                DTEND = toTimestamp(value);
            } else if (code === "LOCATION") {
                LOCATIONS = value;
            } else if (code === "SUMMARY") {
                SUMMARY = value;
            } else if (code === "END" && value === "VEVENT") {
                for (const loc of LOCATIONS.split("\,")) {
                    console.log("loc", loc)
                    const LOCATION = formatKey(loc);

                    if (!liste[LOCATION]) {
                        liste[LOCATION] = [];
                    }
                    liste[LOCATION].push([DTSTART, DTEND, SUMMARY]);
                }
            }
        }

        // Prepare data for writing to files
        const keyDic = {};
        for (const key of Object.keys(liste)) {
            const val = key.split(")_(");
            keyDic[key] = {
                "batiment": val.slice(0, 2).join(" "),
                "salle": val.slice(2).join(" ")
            };
            // Write data to JSON files
            await fs.writeFile(`./src/out/${name}/${key}.json`, JSON.stringify(liste[key]));
        }
        
        console.log("Data processing completed successfully.");
    } catch (error) {
        console.error("Error:", error.message);
    }
}

module.exports = processPlanningsData;