<template>
  <div class="main-container">
    <div class="info">
      <h1>Select a demo</h1>
      <p>
        Click to view an interactive example of a PCI-compliant UI integration
        for online payments.
      </p>
      <p>
        Make sure the payment method you want to use are enabled for your
        account. Refer
        <a href="https://docs.adyen.com/payment-methods#add-payment-methods-to-your-account">the documentation</a>
        to add missing payment methods.
      </p>
      <p>
        To learn more about client-side integration solutions, check out
        <a href="https://docs.adyen.com/checkout">
          Online payments.
        </a>
      </p>
    </div>
    <ul class="integration-list">
      <li class="integration-list-item">
        <nuxt-link to="/preview?type=dropin" class="integration-list-item-link">
          <div class="title-container">
            <p class="integration-list-item-title">Drop-in</p>
          </div>
        </nuxt-link>
      </li>
      <li class="integration-list-item">
        <nuxt-link to="/preview?type=card" class="integration-list-item-link">
          <div class="title-container">
            <p class="integration-list-item-title">Card</p>
          </div>
        </nuxt-link>
      </li>
      <li class="integration-list-item">
        <nuxt-link to="/preview?type=ideal" class="integration-list-item-link">
          <div class="title-container">
            <p class="integration-list-item-title">iDEAL</p>
          </div>
        </nuxt-link>
      </li>
      <li class="integration-list-item">
        <nuxt-link to="/preview?type=sepa" class="integration-list-item-link">
          <div class="title-container">
            <p class="integration-list-item-title">SEPA Direct Debit</p>
          </div>
        </nuxt-link>
      </li>
      <li class="integration-list-item">
        <nuxt-link to="/preview?type=googlepay" class="integration-list-item-link">
          <div class="title-container">
            <p class="integration-list-item-title">Google Pay</p>
          </div>
        </nuxt-link>
      </li>
      <li class="integration-list-item">
        <nuxt-link to="/preview?type=klarnapaynow" class="integration-list-item-link">
          <div class="title-container">
            <p class="integration-list-item-title">Klarna - Pay now</p>
          </div>
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>
