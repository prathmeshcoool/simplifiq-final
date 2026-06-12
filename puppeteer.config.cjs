const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Pin the installation directory explicitly to your live app code
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
