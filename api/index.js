// api/index.js - Vercel serverless entry for NestJS (uses dist build)
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { NestExpressApplication } = require('@nestjs/platform-express');
const serverless = require('serverless-http');
const fs = require('fs');
const dotenv = require('dotenv');
const { uploadPath } = require('../dist/utils/uploadFileHandler');

let server;

async function bootstrap() {
  console.log('[bootstrap] Initializing Nest application');
  // Load env variables (Vercel UI vars take precedence; this is a fallback)
  if (typeof dotenv.config === 'function') {
    dotenv.config();
  }

  const app = await NestFactory.create(AppModule);

  if (typeof app.enableCors === 'function') {
    app.enableCors({ origin: '*', credentials: true });
  }

  // Ensure uploads directory exists (on Vercel this will be /tmp/uploads)
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  if (typeof app.useStaticAssets === 'function') {
    app.useStaticAssets(uploadPath, { prefix: '/uploads/' });
  }

  // Fully initialize Nest app for serverless environments
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp);
}

module.exports = async function handler(req, res) {
  console.log('[handler] Incoming request', {
    method: req.method,
    url: req.url,
    headersHost: req.headers && req.headers.host,
  });
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
};


