<template>
  <div class="status-container">
    <div class="status">
      <img src="~/assets/images/success.svg" class="status-image" alt />

      <img src="~/assets/images/thank-you.svg" class="status-image" alt />

      <p class="status-message">Your order has been successfully placed.</p>
      <nuxt-link class="button" to="/">Return Home</nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  head: {
    title: "Success"
  }
};
</script>