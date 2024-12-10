const { createApp } = require('h3');  // h3 is used in Nitro for server handling
const { createNuxt, loadNuxtConfig } = require('nuxt');

// Setup and start Nuxt.js
async function start() {
  // Load Nuxt config
  const config = await loadNuxtConfig({ dev: process.env.NODE_ENV !== 'production' });

  // Create a new Nuxt instance
  const nuxt = await createNuxt(config);

  // Create a new H3 app (used internally by Nuxt)
  const app = createApp();

  // Attach the Nuxt rendering middleware
  app.use(nuxt.render);

}

start();
