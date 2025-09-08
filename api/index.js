// api/index.js - Vercel serverless entry for NestJS (uses dist build)
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { NestExpressApplication } = require('@nestjs/platform-express');
const serverless = require('serverless-http');
const fs = require('fs');
const dotenv = require('dotenv');
const { uploadPath } = require('../dist/utils/uploadFileHandler');
const express = require('express');

let server;

async function bootstrap() {
  console.log('[bootstrap] Initializing Nest application');
  // Load env variables (Vercel UI vars take precedence; this is a fallback)
  if (typeof dotenv.config === 'function') {
    dotenv.config();
  }

  const app = await NestFactory.create(AppModule, { bodyParser: false });

  if (typeof app.enableCors === 'function') {
    app.enableCors({ origin: '*', credentials: true });
  }

  // Workaround: strip Content-Length before our parsers run to avoid raw-body errors
  app.use((req, _res, next) => {
    try {
      const hasContentLength = typeof req.headers?.['content-length'] !== 'undefined';
      const hasTransferEncoding = typeof req.headers?.['transfer-encoding'] !== 'undefined';
      if (hasContentLength && !hasTransferEncoding) {
        delete req.headers['content-length'];
      }
    } catch (_) {
      // no-op
    }
    next();
  });

  // Re-add JSON and URL-encoded parsers with sane limits
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

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


