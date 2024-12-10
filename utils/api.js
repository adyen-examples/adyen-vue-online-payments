/**
 * Sends a POST request to the specified URL with optional JSON data
 * @param {string} url - The endpoint URL to send the request to
 * @param {Object} [data] - Optional data to be sent in the request body as JSON
 * @returns {Promise<Object>} The parsed JSON response from the server
 * @throws Will throw an error if the fetch request fails
 */
export async function sendPostRequest(url, data) {
  const res = await fetch(url, {
    method: "POST",
    body: data ? JSON.stringify(data) : "",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return await res.json();
} 