<template>
  <div>
    <div id="payment-page">
      <div class="container">
        <div class="payment-container">
          <div class="payment" :ref="`${type}`"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
let AdyenCheckout;
if (process.client) {
  AdyenCheckout = require("@adyen/adyen-web");
}

export default {
  components: {},
  data() {
    return {
      sessionId: '',
      redirectResult: '',
      clientKey: '',
    }
  },
  head() {
    return {
      title: "Payment page",
    };
  },
  asyncData({ route }) {
    return { type: route.params.payment };
  },
  created() {

  },
  async mounted() {

    const urlParams = new URLSearchParams(window.location.search);
    this.redirectResult = urlParams.get('redirectResult');

    if (localStorage.getItem('sessionID')) {
      await this.finalizeCheckout();
      localStorage.clear();
    }
    await this.startCheckout();

  },
  methods: {
    async startCheckout() {
      try {
        // Initiate Sessions
        const {response, clientKey} = await this.callServer("/api/sessions?type=" + this.type);

        // Set Data variables
        this.clientKey = clientKey;
        this.sessionId = response.id;

        // Create a session ID in local storage so value can be stored and retrieved to finalize checkout
        localStorage.setItem('sessionID', this.sessionId);
        localStorage.setItem('clientKey', this.clientKey);

        // Create AdyenCheckout using Sessions response
        const checkout = await this.createAdyenCheckout(response);

        // Create an instance of Drop-in and mount it
        checkout.create(this.type).mount(this.$refs[this.type]);

      } catch (error) {
        console.error(error);
        alert("Error occurred. Look at console for details");
      }
    },

    async finalizeCheckout() {
      try {
        // Create AdyenCheckout re-using existing Session
        const checkout = await this.createAdyenCheckout({id: localStorage.getItem('sessionID')});

        // Submit the extracted redirectResult (to trigger onPaymentCompleted() handler)
        checkout.submitDetails({details: this.redirectResult});

      } catch (error) {
        console.error(error);
        alert("Error occurred. Look at console for details");
      }
    },

    async createAdyenCheckout(session) {
      const configuration = {
        clientKey: localStorage.getItem('clientKey') ,
        locale: "en_US",
        environment: "test", // change to live for production
        showPayButton: true,
        session: session,
        paymentMethodsConfiguration: {
          ideal: {
            showImage: true
          },
          card: {
            hasHolderName: true,
            holderNameRequired: true,
            name: "Credit or debit card",
            amount: {
              value: 1000,
              currency: "EUR"
            }
          },
          paypal: {
            amount: {
              currency: "USD",
              value: 1000
            },
            environment: "test",
            countryCode: "US"   // Only needed for test. This will be automatically retrieved when you are in production.
          }
        },
        onPaymentCompleted: (result, component) => {
          console.log("result: " + result);
          this.handleServerResponse(result, component);
        },
        onError: (error, component) => {
          console.error(error.name, error.message, error.stack, component);
        }
      };

      return new AdyenCheckout(configuration);
    },

    async callServer(url, data) {
      const res = await fetch(url, {
        method: "POST",
        body: data ? JSON.stringify(data) : "",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return await res.json();
    },

    async handleServerResponse(res, component) {
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
  },
};
</script>
