const puppeteer = require('puppeteer');
const url = 'https://ent.univ-rennes1.fr/f/welcome/normal/render.uP';

async function delay(timeout) {
 return new Promise(resolve => {
    setTimeout(resolve, timeout);
 });
}

async function validlogin(login, password) {
 const browser = await puppeteer.launch({ headless: true });
 const page = await browser.newPage();
 try {
    console.log("1. Navigating to the URL...");
    /* Navigate to the specified URL */
    await page.goto(url);

    console.log("2. Clicking on the login button...");
    /* Click the login button */
    await page.click('#portalCASLoginLink');
    await page.waitForSelector('#username');
    console.log("3. Entering the username...");
    await page.type('#username', login);
    console.log("4. Entering the password...");
    await page.type('#password', password);

    console.log("5. Attempting to log in...");
    /* Click the login button */
    await page.click('.mdc-button.mdc-button--raised.btn.btn-primary.btn-primary');
    console.log("");

    console.log("Retry mechanism:");
    // Retry mechanism
    let retryCount = 0;
    let logwrong = null;
    while (retryCount < 3) { // Retry up to 3 times
      try {
        /* Check if the error message exists */
        logwrong = await page.$('#loginErrorsPanel', { timeout: 5000 });
        break; // Break out of the loop if successful
      } catch (error) {
        console.error('Error finding element:', error);
        retryCount++;
        console.log('Retrying...');
        await delay(1000); // Wait for 1 second before retrying
      }
    }
    if (logwrong !== null) {
      /* If logwrong isn't null, that means the error message exists, indicating a failed login */
      await browser.close();
      console.log("Error message exists, login failed");
      return false;
    } else {
      /* Check if the login was successful by trying to access the calendar button */
      let loggood = null;
      loggood = await page.$('a[href="https://planning.univ-rennes1.fr/direct/myplanning.jsp"]');
      if (loggood !== null) {
        /* If the calendar button exists, that means the login was successful */
        await browser.close();
        console.log("Login successful");
        return true;
      } else {
        /* If loggood isn't null, that means the error message doesn't exist, but the login still failed */
        console.error("Login failed");
        await browser.close();
      }
    }
 } catch (error) {
    console.error('Error:', error);
 }
}

module.exports = validlogin;
