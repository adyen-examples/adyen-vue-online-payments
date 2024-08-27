// Import necessary modules
import { defineEventHandler, readBody } from 'h3'; 
import { hmacValidator } from "@adyen/api-library";

export default defineEventHandler(async (event) => {
    console.log("/api/webhooks/notifications");

    // YOUR_HMAC_KEY from the environment variables
    const hmacKey = process.env.ADYEN_HMAC_KEY;

    // Initialize the HMAC validator
    const validator = new hmacValidator();

    // Read the request body
    const notificationRequest = await readBody(event);

    // Fetch first (and only) NotificationRequestItem
    const notification = notificationRequest.notificationItems[0].NotificationRequestItem;

    // Validate the HMAC signature
    if (!validator.validateHMAC(notification, hmacKey)) {
        // Invalid HMAC signature
        console.log("Invalid HMAC signature:", notification);
        // Set the response status to 401 Unauthorized
        event.node.res.statusCode = 401;
        return "Invalid HMAC signature";
    }

    // Process the notification asynchronously based on the eventCode
    await consumeEvent(notification); 

    // Acknowledge event has been consumed by sending a 202 Accepted response
    event.node.res.statusCode = 202;
    return ''; // Return an empty body
});

// Process payload
async function consumeEvent(notification) {
    // Add item to DB, queue or different thread, we just log it for now
    const merchantReference = notification.merchantReference;
    const eventCode = notification.eventCode;
    console.log("merchantReference:" + merchantReference + " eventCode:" + eventCode);
}
