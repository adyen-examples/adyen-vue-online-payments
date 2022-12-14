<template>
  <main class="preview-page">
    <section class="cart">
      <h2>Cart</h2>
      <div class="order-summary">
        <ul class="order-summary-list">
          <li class="order-summary-list-list-item">
            <img
              src="~/assets/images/sunglasses.png"
              class="order-summary-list-list-item-image"
              alt
            />
            <p class="order-summary-list-list-item-title">Sunglasses</p>
            <p class="order-summary-list-list-item-price">50.00</p>
          </li>
          <li class="order-summary-list-list-item">
            <img
              src="~/assets/images/headphones.png"
              class="order-summary-list-list-item-image"
              alt
            />
            <p class="order-summary-list-list-item-title">Headphones</p>
            <p class="order-summary-list-list-item-price">50.00</p>
          </li>
        </ul>
      </div>
      <div class="cart-footer">
        <span class="cart-footer-label">Total:</span>
        <span class="cart-footer-amount">100.00</span>
        <nuxt-link :to="`/checkout/${type}`">
          <p class="button">Continue to checkout</p>
        </nuxt-link>
      </div>
    </section>
  </main>
</template>

<script>
export default {
  asyncData({ route }) {
    return { type: route.query.type };
  },
  head: {
    title: "Cart preview",
  },
};
</script>
