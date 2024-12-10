<template>
  <div class="status-container">
    <div class="status">
      <img v-if="result === 'error' || result === 'failed'" src="~/public/images/failed.svg" class="status-image" alt />
      <div v-else>
        <img src="~/public/images/success.svg" class="status-image" alt />
        <img src="~/public/images/thank-you.svg" class="status-image" alt />
      </div>
      <p class="status-message">
        <span v-if="result === 'error'">
          Error! Please review response in console and refer to
          <a href="https://docs.adyen.com/development-resources/response-handling">Response handling.</a>
        </span>
        <span v-else-if="result === 'failed'">
          The payment was refused. Please try a different payment method or
          card.
        </span>
        <span v-else-if="result === 'pending'">
          Your order has been received! Payment completion pending.
        </span>
        <span v-else> Your order has been successfully placed. </span>
      </p>
      <nuxt-link class="button" to="/">Return Home</nuxt-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

// Find result from route
const result = route.params.result;

</script>
