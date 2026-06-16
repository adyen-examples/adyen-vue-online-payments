import adyen from "@adyen/api-library";

export async function createAdyenClient() {

    try {
        const { CheckoutAPI, Client, Config } = adyen;

        var config = new Config();
        config.apiKey = process.env.ADYEN_API_KEY;
        config.applicationName = "[adyen-vue-online-payments checkout-example adyen-web/6.6.0]";

        const client = new Client({ config });
        client.setEnvironment('TEST'); // Use 'LIVE' for production

        return new CheckoutAPI(client);
    } catch (error) {
        throw new Error("Cannot create Adyen client", { cause: error })
    }
}
