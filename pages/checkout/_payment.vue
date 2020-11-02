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

// Event handlers called when the shopper selects the pay button,
// or when additional information is required to complete the payment
async function handleSubmission(state, component, url) {
  try {
    const res = await callServer(url, state.data);
    handleServerResponse(res, component);
  } catch (error) {
    console.error(error);
    alert("Error occurred. Look at console for details");
  }
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

function filterUnimplemented(pm) {
  pm.paymentMethods = pm.paymentMethods.filter((it) =>
    [
      "scheme",
      "ideal",
      "dotpay",
      "giropay",
      "sepadirectdebit",
      "directEbanking",
      "ach",
      "alipay",
      "klarna_paynow",
      "klarna",
      "klarna_account",
      "boletobancario_santander",
    ].includes(it.type)
  );
  return pm;
}

async function initCheckout(ref) {
  try {
    const { response, clientKey } = await callServer("/api/getPaymentMethods");
    const configuration = {
      paymentMethodsResponse: filterUnimplemented(response),
      clientKey,
      locale: "en_US",
      environment: "test",
      showPayButton: true,
      paymentMethodsConfiguration: {
        ideal: {
          showImage: true,
        },
        card: {
          hasHolderName: true,
          holderNameRequired: true,
          name: "Credit or debit card",
          amount: {
            value: 1000,
            currency: "EUR",
          },
        },
      },
      onSubmit: (state, component) => {
        if (state.isValid) {
          handleSubmission(state, component, "/api/initiatePayment");
        }
      },
      onAdditionalDetails: (state, component) => {
        handleSubmission(state, component, "/api/submitAdditionalDetails");
      },
    };

    const checkout = new AdyenCheckout(configuration);
    const integration = checkout.create(ref.type).mount(ref.$refs[ref.type]);
  } catch (error) {
    console.error(error);
    alert("Error occurred. Look at console for details");
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
    initCheckout(this);
  },
};
</script>
