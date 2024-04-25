const fs = require('fs').promises;
const ical = require('node-ical');
const path = require('path');

// Main function to process event data from a JSON file
async function busytimes(filePath) {
    let name = filePath; // Initialize the name variable with the provided file path

    try {
        // Read the file content as a string
        const eventsArray = await fs.readFile(filePath, 'utf-8');
        // Parse the string content into a JavaScript object
        const events = JSON.parse(eventsArray);
        let slot = []; // Initialize an array to store processed events

        // Check if events are present in the file
        if (events && events.length) {
            // Iterate over each event
            for (const event of events) {
                // Convert the start and end timestamps into hours and dates
                const x = await convertTimestampToHoursAndDate(event[0]);
                const y = await convertTimestampToHoursAndDate(event[1]);
                const eventName = event[2]; // Extract the event name
                // Push the processed event data into the slot array
                slot.push([x, y, eventName]);
            }

            // Convert the slot array into a JSON string with formatting
            const jsonContent = JSON.stringify(slot, null, 2);
            // Transform the file path to the desired directory while keeping the original file name
            name = transformFilePath(name, '/home/florian/PROJET_INFORMATIQUE/EntMini/server/src/out/FINAL_BEAULIEU');
            // Write the processed data to the new file
            await fs.writeFile(name, jsonContent);
            console.log('File written successfully');
        } else {
            console.error('Error: No events found in the file.');
        }

        return slot; // Return the processed events
    } catch (error) {
        console.error('Error processing file:', error);
        return []; // Return an empty array in case of an error
    }
}

// Utility function to transform the file path
function transformFilePath(originalPath, desiredDirectory) {
    // Extract the file name from the original path
    const fileName = path.basename(originalPath);
    // Construct the new file path by joining the desired directory with the file name
    const newPath = path.join(desiredDirectory, fileName);
    return newPath; // Return the new file path
}

// Function to convert a timestamp into hours and date
async function convertTimestampToHoursAndDate(timestamp) {
    const date = new Date(timestamp * 1000); // Convert the timestamp to a Date object
    // Format the date and time into a more readable format
    const hours = date.toLocaleTimeString('en-US', { timeZone: 'Europe/Paris', hour12: false, hour: '2-digit', minute: '2-digit' });
    const dateFormatted = date.toLocaleDateString('en-US', { timeZone: 'Europe/Paris', day: '2-digit', month: '2-digit', year: 'numeric' });
    // Return the formatted hours and date
    return {
        hours,
        date: dateFormatted
    };
}

module.exports = busytimes; // Export the main function for use in other modules