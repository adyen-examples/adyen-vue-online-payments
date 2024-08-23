import adyen from "@adyen/api-library";

export async function createAdyenClient() {

    const { CheckoutAPI, Client, Config } = adyen;
    
    var config = new Config();
    config.apiKey = process.env.ADYEN_API_KEY;

    const client = new Client({ config });
    client.setEnvironment('TEST'); // Use 'LIVE' for production

    return new CheckoutAPI(client);
}
