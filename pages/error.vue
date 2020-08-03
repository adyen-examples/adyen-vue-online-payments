<template>
  <div class="status-container">
    <div class="status">
      <img src="~/assets/images/failed.svg" class="status-image" alt />
      <p class="status-message">
        Error! Please review response in console and refer to
        <a
          href="https://docs.adyen.com/development-resources/response-handling"
        >Response handling.</a>
      </p>
      <nuxt-link class="button" to="/">Return Home</nuxt-link>
    </div>
  </div>
</template>

<script>
export default {
  head: {
    title: "Error"
  }
};
</script>