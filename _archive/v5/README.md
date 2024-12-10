# Sample app with Adyen Adyen Web 5.68.x.

This folder contains the previous version of the sample application that uses **Adyen Web 5.68.x**.

Check the root folder of the repository to use the latest Adyen Web 6.x

## Details

The demo leverages Adyen's API Library for Node.js ([GitHub](https://github.com/Adyen/adyen-node-api-library) | [Docs](https://docs.adyen.com/development-resources/libraries#javascript)).

## Requirements

Node.js 18+
Adyen Web 5.68.x

## Installation

1. Clone this repo:

```
git clone https://github.com/adyen-examples/adyen-vue-online-payments.git
```

2. Navigate to the `v5` directory and install dependencies:

```
cd v5
npm install
```

## Usage

1. Create a `./.env` file with the required info
- [API key](https://docs.adyen.com/user-management/how-to-get-the-api-key)
- [Client Key](https://docs.adyen.com/user-management/client-side-authentication)
- [Merchant Account](https://docs.adyen.com/account/account-structure)
- [HMAC Key](https://docs.adyen.com/development-resources/webhooks/verify-hmac-signatures)

Remember to include ```http://localhost:8080``` in the list of Allowed Origins
```
PORT="8080"
ADYEN_API_KEY="your_API_key_here"
ADYEN_MERCHANT_ACCOUNT="your_merchant_account_here"
ADYEN_CLIENT_KEY="your_client_key_here"
ADYEN_HMAC_KEY="your_hmac_key_here"
```

2. Start the server:

```
npm run dev
```

3. Visit [http://localhost:8080](http://localhost:8080) to select an integration type.

To try out integrations with test card numbers and payment method details, see [Test card numbers](https://docs.adyen.com/development-resources/test-cards/test-card-numbers).

# Webhooks

Webhooks deliver asynchronous notifications about the payment status and other events that are important to receive and process. 
You can find more information about webhooks in [this blog post](https://www.adyen.com/knowledge-hub/consuming-webhooks).

### Webhook setup

In the Customer Area under the `Developers → Webhooks` section, [create](https://docs.adyen.com/development-resources/webhooks/#set-up-webhooks-in-your-customer-area) a new `Standard webhook`.

A good practice is to set up basic authentication, copy the generated HMAC Key and set it as an environment variable. The application will use this to verify the [HMAC signatures](https://docs.adyen.com/development-resources/webhooks/verify-hmac-signatures/).

Make sure the webhook is **enabled**, so it can receive notifications.

### Expose an endpoint

This demo provides a simple webhook implementation exposed at `/api/webhooks/notifications` that shows you how to receive, validate and consume the webhook payload.

### Test your webhook

The following webhooks `events` should be enabled:
* **AUTHORISATION**


To make sure that the Adyen platform can reach your application, we have written a [Webhooks Testing Guide](https://github.com/adyen-examples/.github/blob/main/pages/webhooks-testing.md)
that explores several options on how you can easily achieve this (e.g. running on localhost or cloud).

