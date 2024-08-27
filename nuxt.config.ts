// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Checkout Demo'
    }
  },
  runtimeConfig: {
    adyenApiKey: process.env.ADYEN_API_KEY,
    adyenMerchantAccount: process.env.ADYEN_MERCHANT_ACCOUNT,
    adyenClientKey: process.env.ADYEN_CLIENT_KEY,
    adyenHmacKey: process.env.ADYEN_HMAC_KEY,
  },
  css: ['~/public/css/main.css', '@adyen/adyen-web/dist/adyen.css'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  telemetry: false
})
