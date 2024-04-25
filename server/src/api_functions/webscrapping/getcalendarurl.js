const puppeteer = require('puppeteer');

/* Function to remove the 'target' attribute from a link, allowing the calendar to load on the same page */
async function removeTargetAttributeFromLink(page) {
 await page.evaluate(() => {
    const link = document.querySelector('a[href="https://planning.univ-rennes1.fr/direct/myplanning.jsp"]');
  
    if (link) {
      link.removeAttribute('target');
    }
 });
}

/* Function to retrieve the text content of an element */
async function getElementText(page, selector) {
 const text = await page.evaluate(selector => {
    const element = document.querySelector(selector);
    return element ? element.textContent : null;
 }, selector);
 return text;
}

/* Function to introduce a delay in code execution */
async function delay(timeout) {
 return new Promise(resolve => {
    setTimeout(resolve, timeout);
 });
}

/* Function to automate the process of retrieving a calendar URL */
async function getcalendarurl(url, username, password) {
 let exporturl;
 /* Launch a headless browser instance */
 const browser = await puppeteer.launch({ headless: true }); 
 const page = await browser.newPage(); 

 try {
    console.log("1. Navigating to the provided URL...");
    /* Navigate to the specified URL */
    await page.goto(url);

    console.log("2. Clicking on the login button...");
    /* Click the login button */
    await page.click('#portalCASLoginLink');
    await page.waitForSelector('#username');
    console.log("3. Entering the username...");
    await page.type('#username', username);
    console.log("4. Entering the password...");
    await page.type('#password', password);
    console.log("5. Logging in...");

    /* Click the login button */
    await page.click('.mdc-button.mdc-button--raised.btn.btn-primary.btn-primary');

    /* Wait for the page to load to access the calendar */
    await page.waitForSelector('a[href="https://planning.univ-rennes1.fr/direct/myplanning.jsp"]');
    console.log("6. Waiting for access to the calendar...");

    /* Remove the target attribute from the link to load the calendar on the same page */
    await removeTargetAttributeFromLink(page);
    await page.click('a[href="https://planning.univ-rennes1.fr/direct/myplanning.jsp"]');
    console.log("7. Clicking to access the calendar...");

    /* Wait for the calendar page to load by waiting for a calendar element to appear */
    await page.waitForSelector('#inner2');
    console.log("8. Waiting for the calendar page to load...");

    /* Click on the favorite button when the btn is loaded */
    await page.waitForSelector('#x-auto-122 button.x-btn-text[type="button"][style="position: relative; width: 21px; height: 23px;"][role="button"].x-btn-text');
    console.log("9. Clicking on the favorite button...");

    /* Introduce a delay to avoid crashes */
    await delay(2000)
    await page.click('#x-auto-122 button.x-btn-text[type="button"][style="position: relative; width: 21px; height: 23px;"][role="button"].x-btn-text');

    /* Wait for the favorite page to load by waiting for a calendar element to appear, introduce a delay to avoid crash */
    console.log("10. Waiting for the favorite page to load...");
    await delay(10000)
    await page.waitForSelector('#inner2');

    /* Click on the export button when the btn is loaded */
    console.log("11. Clicking on the export button...");
    await page.click('#x-auto-113 [type="button"][style="position: relative; width: 35px; height: 37px;"][role="button"].x-btn-text');
    await delay(2000)

    /* Wait for the export page to load by waiting for the btn to load */
    console.log("12. Waiting for the export page to load...");
    await page.waitForSelector('[role="alertdialog"] button.x-btn-text[type="button"][style="position: relative; width: 102px;"]');
    const button = await page.$('[role="alertdialog"] button.x-btn-text[type="button"][style="position: relative; width: 102px;"]');
    await button.click();
    await delay(1000);

    /* Retrieve the export URL */
    exporturl = await getElementText(page, '#logdetail');
    console.log("13. Retrieving the export URL...");
    console.log("Export URL:", exporturl);
 } catch (error) {
    console.error('Error:', error);
 } finally {
    await browser.close();
    return exporturl;
 }
}
module.exports = getcalendarurl;