<template>
  <div>
    <div id="payment-page">
      <div class="container">
        <div class="payment-container">
          <div id="component-container" class="payment"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue';
import { AdyenCheckout, Redirect } from '@adyen/adyen-web';

// Reactive references
const sessionId = ref('');
const redirectResult = ref('');

// Function to invoke server-side API
async function sendPostRequest(url, data) {
  const res = await fetch(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : "",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
}

// Function to handle the server response
async function handleServerResponse(res, component) {
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

// Function to create AdyenCheckout instance
async function createAdyenCheckout(session) {
  return AdyenCheckout(
    {
      clientKey: useRuntimeConfig().public.adyenClientKey,
      session: session,
      environment: "test",
      amount: {
        value: 10000,
        currency: 'EUR'
      },
      locale: "en_US",
      countryCode: 'NL',
      showPayButton: true,
      onPaymentCompleted: (result, component) => {
        console.info("onPaymentCompleted");
        console.info(result, component);
        handleServerResponse(result, component);
      },
      onPaymentFailed: (result, component) => {
        console.info("onPaymentFailed");
        console.info(result, component);
        handleServerResponse(result, component);
      },
      onError: (error, component) => {
        console.error("onError");
        console.error(error.name, error.message, error.stack, component);
        handleServerResponse(error, component);
      },
    }
  );
}

// Function to start checkout
async function startCheckout() {
  try {
    const { response } = await sendPostRequest(`/api/sessions`);

    const checkout = await createAdyenCheckout(response);
    const ideal = new Redirect(checkout, { type: 'ideal' })
    .mount('#component-container');

  } catch (error) {
    console.error(error);
    alert("Error occurred. Look at console for details");
  }
}

// Function to finalize checkout
async function finalizeCheckout() {
  try {
    const checkout = await createAdyenCheckout({ id: sessionId.value });
    checkout.submitDetails({ details: redirectResult.value });
  } catch (error) {
    console.error(error);
    alert("Error occurred. Look at console for details");
  }
}

// onMounted lifecycle hook to handle component initialization
onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  sessionId.value = urlParams.get('sessionId');
  redirectResult.value = urlParams.get('redirectResult');

  if (sessionId.value) {
    await finalizeCheckout();
  } else {
    await startCheckout();
  }
});

</script>
