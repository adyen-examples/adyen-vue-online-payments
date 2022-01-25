const express = require("express");
const consola = require("consola");
const dotenv = require("dotenv");
const { v4: uuid } = require("uuid");
const { hmacValidator } = require('@adyen/api-library');
const { Client, Config, CheckoutAPI } = require("@adyen/api-library");
const { Nuxt, Builder } = require("nuxt");

// init app
const app = express();
// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Import and set Nuxt.js options
const nuxtConfig = require("../nuxt.config.js");
nuxtConfig.dev = process.env.NODE_ENV !== "production";

// Enables environment variables by parsing the .env file and assigning it to process.env
dotenv.config({
  path: "./.env"
});

// Adyen Node.js API library boilerplate (configuration, etc.)
const config = new Config();
config.apiKey = process.env.ADYEN_API_KEY;
const client = new Client({ config });
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);

/* ################# API ENDPOINTS ###################### */

// Invoke /sessions endpoint
app.post("/api/sessions", async (req, res) => {

  try {
    // unique ref for the transaction
    const orderRef = uuid();
    // Ideally the data passed here should be computed based on business logic
    const response = await checkout.sessions({
      amount: { currency: "EUR", value: 1000 }, // value is 10€ in minor units
      countryCode: "NL",
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT, // required
      reference: orderRef, // required: your Payment Reference
      returnUrl: `http://localhost:8080/api/handleShopperRedirect?orderRef=${orderRef}` // set redirect URL required for some payment methods
    });
    res.json({ response, clientKey: process.env.ADYEN_CLIENT_KEY });
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.status(err.statusCode).json(err.message);
  }
});

// Handle all redirects from payment type
app.all("/api/handleShopperRedirect", async (req, res) => {
  // Create the payload for submitting payment details
  const redirect = req.method === "GET" ? req.query : req.body;
  const details = {};
  if (redirect.redirectResult) {
    details.redirectResult = redirect.redirectResult;
  } else if (redirect.payload) {
    details.payload = redirect.payload;
  }

  try {
    const response = await checkout.paymentsDetails({ details });
    // Conditionally handle different result codes for the shopper
    switch (response.resultCode) {
      case "Authorised":
        res.redirect("/result/success");
        break;
      case "Pending":
      case "Received":
        res.redirect("/result/pending");
        break;
      case "Refused":
        res.redirect("/result/failed");
        break;
      default:
        res.redirect("/result/error");
        break;
    }
  } catch (err) {
    console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
    res.redirect("/result/error");
  }
});

/* ################# end API ENDPOINTS ###################### */

/* ################# WEBHOOK ###################### */

app.post("/api/webhook/notifications", async (req, res) => {

  const hmacKey = process.env.AYDEN_HMAC_KEY;
  const validator = new hmacValidator();
  // Notification Request JSON
  const notificationRequest = req.body;
  const notificationRequestItems = notificationRequest.notificationItems;

  // Handling multiple notificationRequests
  let validHMAC = true;
  notificationRequestItems.forEach(function(notificationRequestItem) {

    const notification = notificationRequestItem.NotificationRequestItem
    // Handle the notification
    if( validator.validateHMAC(notification, hmacKey) ) {
      // Process the notification based on the eventCode
      const merchantReference = notification.merchantReference;
      const eventCode = notification.eventCode;
      console.log('merchantReference:' + merchantReference + " eventCode:" + eventCode);
    } else {
      // In case of an invalid HMAC signature
      console.log("Non valid NotificationRequest");
      validHMAC = false;
    }
  });
  // Send [accepted] only when all HMAC signatures are valid
  if(validHMAC) {
    res.send('[accepted]')
  }
});


/* ################# end WEBHOOK ###################### */

// Setup and start Nuxt.js
async function start() {
  const nuxt = new Nuxt(nuxtConfig);

  const { host, port } = nuxt.options.server;

  await nuxt.ready();
  if (nuxtConfig.dev) {
    const builder = new Builder(nuxt);
    await builder.build();
  }

  app.use(nuxt.render);

  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  });
}
start();
