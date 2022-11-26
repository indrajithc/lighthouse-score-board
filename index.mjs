import express from "express";
import fs from "fs";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import CDP from "chrome-remote-interface";
import puppeteer from "puppeteer";

const app = express();
const port = 9000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/d", async (req, res) => {
  const url = req?.query?.url;
  console.log("d", { url});
  const chrome = await launch({
    chromeFlags: [
      // "--user-agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36'",
      "--headless",
      "--no-sandbox", 
      // '--disable-setuid-sandbox',
      '--lang=en-US'
      // "--proxy-server=localhost:8080",
      // "--remote-debugging-port=9222"
    ],
  });

  console.log("o================>");
  
  const protocol = await CDP({ port: chrome.port });
  
  console.log("1================>");
  // Extract the DevTools protocol domains we need and enable them.
  // See API docs: https://chromedevtools.github.io/devtools-protocol/
  const { Page, Runtime , ...rest} = protocol;
  console.log("2================>");
  // console.log({Page, Runtime, ...rest});
  await Promise.all([Page.enable(), Runtime.enable()]);
  
  console.log("3================>");

  Page.navigate({ url });
  console.log("4================>");

  // Wait for window.onload before doing stuff.
  Page.loadEventFired(async () => {
    const js = "document.documentElement.innerHTML";
  console.log("6================>");
  // Evaluate the JS expression in the page.
    const result = await Runtime.evaluate({ expression: js });

    console.log("Title of page: " + result.result.value);

    protocol.close();

    await chrome.kill();
    chrome.kill(); // Kill Chrome.
  });
  console.log("5================>");

  res.send("Lighthouse says Hi");
});


app.get("/lha", async (req, res) => {
  console.log("lha");
  const chrome = await launch({
    chromeFlags: [
      "--headless",
      "--no-sandbox",
      // "--proxy-server=localhost:8080",
      // "--remote-debugging-port=9222"
    ],
  });





  const protocol = await CDP({ port: chrome.port });

  console.log({ chrome });

  // Extract the DevTools protocol domains we need and enable them.
  // See API docs: https://chromedevtools.github.io/devtools-protocol/
  const { Page, Runtime , ...rest} = protocol;
  // console.log({Page, Runtime, ...rest});
  await Promise.all([Page.enable(), Runtime.enable()]);


  Page.navigate({ url: 'https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html' });

  // Wait for window.onload before doing stuff.
  Page.loadEventFired(async () => {
    const js = "document.documentElement.innerHTML";
    // Evaluate the JS expression in the page.
    const result = await Runtime.evaluate({ expression: js });

    console.log("Title of page: " + result.result.value);

    protocol.close();

    // await chrome.kill();
    // chrome.kill(); // Kill Chrome.
  });
  res.send("Lighthouse says Hi");
});


app.get("/lh", async (req, res) => {
  console.log("lh");
  const chrome = await launch({
    chromeFlags: [
      "--headless",
      "--no-sandbox",
      // "--proxy-server=localhost:8080",
      // "--remote-debugging-port=9222"
    ],
  });

 
  console.log({ chrome });
  const options = {
    logLevel: "info",
    output: "html",
    onlyCategories: ["performance"],
    port: chrome.port,
  };
  const runnerResult = await lighthouse(
    "https://www.google.com/",
    options,
  );

  // `.report` is the HTML report as a string
  const reportHtml = runnerResult.report;
  fs.writeFileSync("lhreport.html", reportHtml);

  // `.lhr` is the Lighthouse Result as a JS object
  console.log(
    "Report is done forhttps://www.google.com/",
    runnerResult.lhr.finalDisplayedUrl,
  );
  console.log(
    "Performance score was",
    runnerResult.lhr.categories.performance.score * 100,
  );

  // await chrome.kill();

  res.send("Lighthouse says Hi");
});


app.get("/lhb", async (req, res) => {
  const url = req?.query?.url;
  console.log("lhb", { url});
  const chrome = await launch({
    chromeFlags: [
      "--headless",
      "--no-sandbox",
      // "--proxy-server=localhost:8080",
      // "--remote-debugging-port=9222"
    ],
  });

 
  const options = {
    logLevel: "info",
    output: "html",
    onlyCategories: ["performance"],
    port: chrome.port,
  };
  const runnerResult = await lighthouse(
    url,
    options,
  );

  // `.report` is the HTML report as a string
  const reportHtml = runnerResult.report;
  fs.writeFileSync("lhreport.html", reportHtml);

  // `.lhr` is the Lighthouse Result as a JS object
  console.log(
    "Report is done for "+url,
    runnerResult.lhr.finalDisplayedUrl,
  );
  console.log(
    "Performance score was",
    runnerResult.lhr.categories,
    runnerResult.lhr.categories.performance.score * 100,
  );

  await chrome.kill();

  res.send("Lighthouse says Hi");
});


app.get("/p", async(req, res) => {


// This is where we'll put the code to get around the tests.
const preparePageForTests = async (page) => {
  // Pass the User-Agent Test.
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.79 Safari/537.36';
  await page.setUserAgent(userAgent);

  // Pass the Webdriver Test.
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  // Pass the Chrome Test.
  await page.evaluateOnNewDocument(() => {
    // We can mock this in as much depth as we need for the test.
    window.chrome = {
      runtime: {},
      // etc.
    };
  });

  // Pass the Permissions Test.
  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query;
    return window.navigator.permissions.query = (parameters) => (
      parameters.name === 'notifications' ?
        Promise.resolve({ state: Notification.permission }) :
        originalQuery(parameters)
    );
  });

  // Pass the Plugins Length Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, 'plugins', {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5],
    });
  });

  // Pass the Languages Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en'],
    });
  });
}

// Launch the browser in headless mode and set up a page.
const browser = await puppeteer.launch({
  args: ['--no-sandbox'],
  headless: false,
});
const page = await browser.newPage();

// Prepare for the tests (not yet implemented).
await preparePageForTests(page);

// Navigate to the page that will perform the tests.
const testUrl = 'https://www.google.com/';
await page.goto(testUrl);

// Save a screenshot of the results.
await page.screenshot({path: 'headless-test-result.png'});

// // Clean up.
// await browser.close()


  res.send("Hello World!");
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


/**
462  sudo docker build -t lh_app .
463  sudo systemctl restart docker
464  sudo docker run -ti lh_app /bin/bash
465  sudo docker run --publish 9000:9000 lh_app
 */