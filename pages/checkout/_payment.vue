<template>
  <div>
    <div id="payment-page">
      <div class="container">
        <div class="payment-container">
          <div class="payment" :ref="`${type}`"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let AdyenCheckout;
if (process.client) {
  AdyenCheckout = require("@adyen/adyen-web");
}

// Used to finalize a checkout call in case of redirect
const urlParams = new URLSearchParams(window.location.search);
var sessionId = null /*urlParams.get('sessionId');*/ // Unique identifier for the payment session
var redirectResult = null /*urlParams.get('redirectResult');*/
var localclientKey = null


async function startCheckout(ref) {
  try {
    // Init Sessions
    let { response, clientKey } = await callServer("/api/sessions?type=" + ref.type);

    // Set global variables
    localclientKey = clientKey
    const checkoutSessionResponse = response
    sessionId = checkoutSessionResponse.id
    redirectResult = checkoutSessionResponse.redirectResult

    // Create AdyenCheckout using Sessions response
    const checkout = await createAdyenCheckout(checkoutSessionResponse)

    // Create an instance of Drop-in and mount it
    checkout.create(ref.type).mount(ref.$refs[ref.type]);

  } catch (error) {
    console.error(error);
    alert("Error occurred. Look at console for details");
  }
}

// Some payment methods use redirects. This is where we finalize the operation
async function finalizeCheckout() {
  try {
    alert("finalize")
    // Create AdyenCheckout re-using existing Session
    const checkout = await createAdyenCheckout({id: sessionId});
    // Submit the extracted redirectResult (to trigger onPaymentCompleted() handler)
    checkout.submitDetails({details: {redirectResult}});
  } catch (error) {
    console.error(error);
    alert("Error occurred. Look at console for details");
  }
}

async function createAdyenCheckout(session) {

  const configuration = {
    clientKey: localclientKey,
    locale: "en_US",
    environment: "test",
    showPayButton: true,
    session: session,
    paymentMethodsConfiguration: {
      ideal: {
        showImage: true
      },
      card: {
        hasHolderName: true,
        holderNameRequired: true,
        name: "Credit or debit card",
        amount: {
          value: 1000,
          currency: "EUR"
        }
      },
      paypal: {
        amount: {
          currency: "USD",
          value: 1000
        },
        environment: "test",
        countryCode: "US"   // Only needed for test. This will be automatically retrieved when you are in production.
      }
    },
    onPaymentCompleted: (result, component) => {
      console.log("result: " + result);
      handleServerResponse(result, component);
    },
    onError: (error, component) => {
      console.error(error.name, error.message, error.stack, component);
    }
  };

  return new AdyenCheckout(configuration);
}

// Calls your server endpoints
async function callServer(url, data) {
  const res = await fetch(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : "",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

// Handles responses sent from your server to the client
function handleServerResponse(res, component) {
  if (res.action) {
    component.handleAction(res.action);
  } else {
    switch (res.resultCode) {
      case "Authorised":
        window.location.href = "/result/success";
        break;
      case "Pending":
      case "Received":
        window.location.href = "/result/pending";
        break;
      case "Refused":
        window.location.href = "/result/failed";
        break;
      default:
        window.location.href = "/result/error";
        break;
    }
  }
}

export default {
  components: {},
  head() {
    return {
      title: "Payment page",
    };
  },
  asyncData({ route }) {
    return { type: route.params.payment };
  },
  mounted() {
    if (!sessionId) {
      startCheckout(this);
    } else {
      // existing session: complete Checkout
      finalizeCheckout();
    }
  },
};
</script>
