const express = require("express");
const consola = require("consola");
const dotenv = require("dotenv");
const { Client, Config, CheckoutAPI } = require("@adyen/api-library");
const { Nuxt, Builder } = require("nuxt");
const app = express();

// Import and set Nuxt.js options
const nuxtConfig = require("../nuxt.config.js");
nuxtConfig.dev = process.env.NODE_ENV !== "production";

// Parse JSON bodies
app.use(express.json());
// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Enables environment variables by parsing the .env file and assigning it to process.env
dotenv.config({
  path: "./.env"
});

// Adyen Node.js API library boilerplate (configuration, etc.)
const config = new Config();
config.apiKey = process.env.API_KEY;
const client = new Client({ config });
client.setEnvironment("TEST");
const checkout = new CheckoutAPI(client);

// A temporary store to keep payment data to be sent in additional payment details and redirects.
// This is more secure than a cookie. In a real application, this should be in a database.
const paymentDataStore = {};

app.get("/api/getPaymentMethods", (req, res) => {
  checkout
    .paymentMethods({
      channel: "Web",
      merchantAccount: process.env.MERCHANT_ACCOUNT
    })
    .then(response => {
      res.json({
        clientKey: process.env.CLIENT_KEY,
        response: JSON.stringify(response)
      });
    })
    .catch(error => {
      console.log(error);
    });
});

app.post("/api/initiatePayment", (req, res) => {
  const currency = findCurrency(req.body.paymentMethod.type);

  checkout
    .payments({
      amount: { currency, value: 1000 },
      reference: "12345",
      merchantAccount: process.env.MERCHANT_ACCOUNT,
      shopperIP: "192.168.1.3",
      channel: "Web",
      additionalData: {
        allow3DS2: true
      },
      returnUrl: "http://localhost:8080/api/handleShopperRedirect",
      // riskData: req.body.riskData,
      browserInfo: req.body.browserInfo,
      paymentMethod: req.body.paymentMethod.type.includes("boleto")
        ? {
            type: "boletobancario_santander"
          }
        : req.body.paymentMethod,
      // Required for Boleto:
      socialSecurityNumber: req.body.socialSecurityNumber,
      shopperName: req.body.shopperName,
      billingAddress:
        typeof req.body.billingAddress === "undefined" ||
        Object.keys(req.body.billingAddress).length === 0
          ? null
          : req.body.billingAddress,
      deliveryDate: "2023-12-31T23:00:00.000Z",
      shopperStatement:
        "Aceitar o pagamento até 15 dias após o vencimento.Não cobrar juros. Não aceitar o pagamento com cheque",
      // Required for Klarna:
      countryCode: req.body.paymentMethod.type.includes("klarna") ? "DE" : null,
      shopperReference: "12345",
      shopperEmail: "youremail@email.com",
      shopperLocale: "en_US",
      lineItems: [
        {
          quantity: "1",
          amountExcludingTax: "331",
          taxPercentage: "2100",
          description: "Shoes",
          id: "Item 1",
          taxAmount: "69",
          amountIncludingTax: "400"
        },
        {
          quantity: "2",
          amountExcludingTax: "248",
          taxPercentage: "2100",
          description: "Socks",
          id: "Item 2",
          taxAmount: "52",
          amountIncludingTax: "300"
        }
      ]
    })
    .then(response => {
      let paymentMethodType = req.body.paymentMethod.type;
      let resultCode = response.resultCode;
      let redirectUrl =
        response.redirect !== undefined ? response.redirect.url : null;
      let action = null;
      if (response.action) {
        action = response.action;
        paymentDataStore["paymentData"] = action.paymentData;
      }
      res.json({ paymentMethodType, resultCode, redirectUrl, action });
    })
    .catch(error => {
      console.log(error);
    });
});

app.all("/api/handleShopperRedirect", (req, res) => {
  let payload = {};
  payload["details"] = req.method === "GET" ? req.query : req.body;
  payload["paymentData"] = paymentDataStore["paymentData"];

  checkout.paymentsDetails(payload).then(response => {
    delete paymentDataStore["paymentData"];
    switch (response.resultCode) {
      case "Authorised":
        res.redirect("/success");
        break;
      case "Pending":
        res.redirect("/pending");
        break;
      case "Refused":
        res.redirect("/failed");
        break;
      default:
        res.redirect("/error");
        break;
    }
  });
});

app.post("/api/submitAdditionalDetails", (req, res) => {
  let payload = {};
  payload["details"] = req.body.details;
  payload["paymentData"] = req.body.paymentData;

  checkout.paymentsDetails(payload).then(response => {
    let resultCode = response.resultCode;
    let action = response.action || null;

    res.json({ action, resultCode });
  });
});

function findCurrency(type) {
  switch (type) {
    case "ach":
      return "USD";
    case "ideal":
    case "giropay":
    case "klarna_paynow":
    case "sepadirectdebit":
    case "directEbanking":
      return "EUR";
      break;
    case "wechatpayqr":
    case "alipay":
      return "CNY";
      break;
    case "dotpay":
      return "PLN";
      break;
    case "boletobancario":
    case "boletobancario_santander":
      return "BRL";
      break;
    default:
      return "EUR";
      break;
  }
}

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
