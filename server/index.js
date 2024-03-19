const express = require("express");
const consola = require("consola");
const dotenv = require("dotenv");
const { v4: uuid } = require("uuid");
const { hmacValidator } = require('@adyen/api-library');
const { Client, Config, CheckoutAPI } = require("@adyen/api-library");
const { Nuxt, Builder } = require("nuxt");

// Init app
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
client.setEnvironment("TEST"); // change to LIVE for production
const checkout = new CheckoutAPI(client);

/* ################# API ENDPOINTS ###################### */

// Invoke /sessions endpoint
app.post("/api/sessions", async (req, res) => {

  try {
    // Unique ref for the transaction
    const orderRef = uuid();
    // Determine host (for setting returnUrl)
    const protocol = req.socket.encrypted? 'https' : 'http';
    const host = req.get('host');

    // Ideally the data passed here should be computed based on business logic
    const response = await checkout.PaymentsApi.sessions({
      amount: { currency: "EUR", value: 10000 }, // Value is 100€ in minor units
      countryCode: "NL",
      merchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT, // Required: your merchant account
      reference: orderRef, // Required: your Payment Reference
      // set lineItems required for some payment methods (ie Klarna)
      lineItems: [
        {quantity: 1, amountIncludingTax: 5000 , description: "Sunglasses"},
        {quantity: 1, amountIncludingTax: 5000 , description: "Headphones"}
      ] ,
      returnUrl: `${protocol}://${host}/api/handleShopperRedirect?orderRef=${orderRef}` // Required `returnUrl` param: Set redirect URL required for some payment methods
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
    const response = await checkout.PaymentsApi.paymentsDetails({ details });
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
app.post("/api/webhooks/notifications", async (req, res) => {
  // YOUR_HMAC_KEY from the Customer Area
  const hmacKey = process.env.ADYEN_HMAC_KEY;
  const validator = new hmacValidator()

  // NotificationRequest JSON
  const notificationRequest = req.body;

  // Fetch first (and only) NotificationRequestItem
  const notification = notificationRequest.notificationItems[0].NotificationRequestItem;

  // Handle the notification
  if(!validator.validateHMAC(notification, hmacKey)) {
    // invalid hmac
    console.log("Invalid HMAC signature: " + notification);
    res.status(401).send('Invalid HMAC signature');
    return;
  }

  // Process the notification asynchronously based on the eventCode
  consumeEvent(notification);

  // acknowledge event has been consumed
  res.status(202).send(); // Send a 202 response with an empty body
});

// Process payload
function consumeEvent(notification) {
  // Add item to DB, queue or different thread, we just log it for now
  const merchantReference = notification.merchantReference;
  const eventCode = notification.eventCode;
  console.log('merchantReference:' + merchantReference + " eventCode:" + eventCode);
}


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
    message: `Server listening on ${host}:${port}`,
    badge: true
  });
}
start();
