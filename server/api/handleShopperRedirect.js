import { defineEventHandler, getQuery, readBody, sendRedirect } from 'h3';
import { createAdyenClient } from '../adyen';

export default defineEventHandler(async (event) => {
    console.log("/api/handleShopperRedirect");

    const adyenCheckout = await createAdyenClient();

    try {

        // Read query parameters or request body based on the method
        const redirect = event.node.req.method === 'GET' ? getQuery(event) : await readBody(event);

        // Create the payload for submitting payment details
        const details = {};

        if (redirect.redirectResult) {
            details.redirectResult = redirect.redirectResult;
        } else if (redirect.payload) {
            details.payload = redirect.payload;
        }

        // Call the Adyen Payments API
        const response = await adyenCheckout.PaymentsApi.paymentsDetails({ details });
        console.log(response);

        // Conditionally handle different result codes
        switch (response.resultCode) {
            case 'Authorised':
                return sendRedirect(event, '/result/success');
            case 'Pending':
            case 'Received':
                return sendRedirect(event, '/result/pending');
            case 'Refused':
                return sendRedirect(event, '/result/failed');
            default:
                return sendRedirect(event, '/result/error');
        }
    } catch (err) {
        console.error(`Error: ${err.message}, error code: ${err.errorCode}`);
        return sendRedirect(event, '/result/error');
    }
});
