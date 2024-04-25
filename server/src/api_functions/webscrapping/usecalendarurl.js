const fs = require('fs');
const https = require('https');

/* Function to download a calendar file from a given URL */
async function usecalendarurl(url, username) {
    return new Promise((resolve, reject) => {
        /* Construct the filename using the username */
        const filename = `${username}ADE.ics`;

        /* Create a write stream to save the file */
        const fileStream = fs.createWriteStream(`./src/assets/${filename}`, { flags: 'w' });

        /* Initiate the download */
        https.get(url, response => {
            if (response.statusCode !== 200) {
                /* Handle non-200 status codes */
                reject(new Error(`Failed to download file: ${response.statusCode}`));
                return;
            }

            /* Pipe the response data to the file stream */
            response.pipe(fileStream);

            /* Handle successful file stream completion */
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(filename);
                console.log("Created ", filename);
            });

            /* Handle errors during file stream operations */
            fileStream.on('error', error => {
                /* Clean up the partially downloaded file */
                fs.unlink(`./src/assets/${filename}`, () => {}); 
                reject(error);
            });
        }).on('error', error => {
            /* Handle errors during the HTTP request */
            reject(error);
        });
    });
}

module.exports = usecalendarurl;
