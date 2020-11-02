<template>
  <div class="status-container">
    <div class="status">
      <img
        v-if="type === 'error' || type === 'failed'"
        src="~/assets/images/failed.svg"
        class="status-image"
        alt
      />
      <div v-else>
        <img src="~/assets/images/success.svg" class="status-image" alt />
        <img src="~/assets/images/thank-you.svg" class="status-image" alt />
      </div>
      <p class="status-message">
        <span v-if="type === 'error'">
          Error! Please review response in console and refer to
          <a
            href="https://docs.adyen.com/development-resources/response-handling"
            >Response handling.</a
          >
        </span>
        <span v-else-if="type === 'failed'">
          The payment was refused. Please try a different payment method or
          card.
        </span>
        <span v-else-if="type === 'pending'">
          Your order has been received! Payment completion pending.
        </span>
        <span v-else> Your order has been successfully placed. </span>
      </p>
      <nuxt-link class="button" to="/">Return Home</nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  head: {
    title: "Result",
  },
  asyncData({ route }) {
    return { type: route.params.page };
  },
};
</script>
