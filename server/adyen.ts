import adyen from "@adyen/api-library";
import { readFileSync } from "fs";
import { resolve } from "path";

const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf-8"));
const adyenWebVersion = packageJson.dependencies["@adyen/adyen-web"].replace(/^\^/, "");

export async function createAdyenClient() {

    try {
        const { CheckoutAPI, Client, Config } = adyen;

        var config = new Config();
        config.apiKey = process.env.ADYEN_API_KEY;
        config.applicationName = `adyen-vue-online-payments checkout-example adyen-web/${adyenWebVersion}`;

        const client = new Client({ config });
        client.setEnvironment('TEST'); // Use 'LIVE' for production

        return new CheckoutAPI(client);
    } catch (error) {
        throw new Error("Cannot create Adyen client", { cause: error })
    }
}
