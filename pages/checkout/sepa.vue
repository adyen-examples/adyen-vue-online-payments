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
import { AdyenCheckout, SepaDirectDebit } from '@adyen/adyen-web';
import { sendPostRequest } from '~/utils/api';

// Reactive references
const sessionId = ref('');
const redirectResult = ref('');

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
        console.info("onPaymentCompleted", result, component);
        handleOnPaymentCompleted(result.resultCode);
      },
      onPaymentFailed: (result, component) => {
        console.info("onPaymentFailed", result, component);
        handleOnPaymentFailed(result.resultCode);
      },
      onError: (error, component) => {
        console.error("onError", error.name, error.message, error.stack, component);
        window.location.href = "/result/error";
      },
    }
  );
}

// Function to handle payment completion redirects
function handleOnPaymentCompleted(resultCode) {
  switch (resultCode) {
    case "Authorised":
      window.location.href = "/result/success";
      break;
    case "Pending":
    case "Received":
      window.location.href = "/result/pending";
      break;
    default:
      window.location.href = "/result/error";
      break;
  }
}

// Function to handle payment failure redirects
function handleOnPaymentFailed(resultCode) {
  switch (resultCode) {
    case "Cancelled":
    case "Refused":
      window.location.href = "/result/failed";
      break;
    default:
      window.location.href = "/result/error";
      break;
  }
}

// Function to start checkout
async function startCheckout() {
  try {
    const { response } = await sendPostRequest(`/api/sessions`);

    const checkout = await createAdyenCheckout(response);
    const ideal = new SepaDirectDebit(checkout, {
      countryCode: 'NL',
      holderName: true
      })
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
