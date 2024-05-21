const fs = require('fs');
const ical = require('node-ical');

/* Function to convert an ICS file into a usable JSON format */
async function parseICS(filepath, username) {
    try {
        /* Construct the file path to the ICS file */
        const filePath = `./src/assets/${filepath}`;
        /* Parse the ICS file synchronously */
        const events = ical.sync.parseFile(filePath);
        const formattedEvents = [];

        /* Iterate through the events and format them */
        for (const event of Object.values(events)) {
            /* Verify the event has necessary fields */
            if (event && event.summary && event.location && event.start && event.end) {
                /* Format the event and add it to the formattedEvents array */
                formattedEvents.push({
                    start: event.start.toISOString(),
                    end: event.end.toISOString(),
                    title: event.summary,
                    summary: event.location,
                });
            }
        }

        /* Write the formatted events to a JSON file */
        fs.writeFileSync(`./src/assets/${username}ADE.json`, JSON.stringify(formattedEvents, null, 2), { flags: 'w' });
        console.log("Created ", `./src/assets/${username}ADE.json`);
        return formattedEvents;
    } catch (error) {
        console.error('Error parsing ICS file:', error);
        return [];
    }
}

module.exports = parseICS;