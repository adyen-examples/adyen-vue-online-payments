<template>
  <div class="status-container">
    <div class="status">
      <img src="~/assets/images/failed.svg" class="status-image" alt />

      <p
        class="status-message"
      >The payment was refused. Please try a different payment method or card.</p>
      <nuxt-link class="button" to="/">Return Home</nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  head: {
    title: "Refused"
  }
};
</script>