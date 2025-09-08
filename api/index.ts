// api/index.js
const appPromise = require('../dist/main').default;

// Vercel requires a function handler
module.exports = async (req, res) => {
  const app = await appPromise;
  return app(req, res);
};
