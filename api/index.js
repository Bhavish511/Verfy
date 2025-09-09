// api/index.js - Vercel serverless entry for NestJS (uses dist build)
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { NestExpressApplication } = require('@nestjs/platform-express');
const serverless = require('serverless-http');
const fs = require('fs');
const dotenv = require('dotenv');
const { uploadPath } = require('../dist/utils/uploadFileHandler');
const express = require('express');

let server = globalThis.__vercelNestServer;

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

  // Global safety timeout (20s) to avoid hanging requests
  app.use((req, res, next) => {
    const timeoutMs = 20000;
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished && !res.headersSent) {
        try {
          res.statusCode = 504;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, message: 'Request timed out' }));
        } catch (_) {}
      }
    }, timeoutMs);
    res.on('finish', () => { finished = true; clearTimeout(timer); });
    res.on('close', () => { finished = true; clearTimeout(timer); });
    next();
  });

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

  // Normalize paths coming from Vercel (strip leading /api for framework routing)
  app.use((req, _res, next) => {
    if (typeof req.url === 'string' && req.url.startsWith('/api/')) {
      const originalUrl = req.url;
      req.url = req.url.replace(/^\/api\//, '/');
      console.log('[path-rewrite] url', { originalUrl, rewrittenUrl: req.url });
    }
    next();
  });

  // Lightweight JSON parser to avoid raw-body/content-length issues
  app.use((req, _res, next) => {
    const contentType = req.headers['content-type'] || '';
    const isJson = typeof contentType === 'string' && contentType.includes('application/json');
    if (!isJson || req.method === 'GET' || req.method === 'HEAD') return next();

    let bytesRead = 0;
    const chunks = [];
    const maxBytes = 5 * 1024 * 1024; // 5mb
    let ended = false;
    const done = (err) => {
      if (ended) return;
      ended = true;
      if (err) return next(err);
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        req.body = raw ? JSON.parse(raw) : {};
      } catch (e) {
        return next(e);
      }
      next();
    };

    req.on('data', (chunk) => {
      bytesRead += chunk.length;
      if (bytesRead > maxBytes) {
        return done(new Error('Payload too large'));
      }
      chunks.push(chunk);
    });
    req.on('end', () => done());
    req.on('error', (e) => done(e));
    req.on('aborted', () => done(new Error('Client aborted')));
  });

  // Final error handler to guarantee a response
  app.use((err, _req, res, _next) => {
    try {
      const status = typeof err.status === 'number' ? err.status : 500;
      const message = err?.message || 'Internal Server Error';
      if (!res.headersSent) {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, message }));
        return;
      }
    } catch (_) {}
    try { res.end(); } catch (_) {}
  });

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

async function handler(req, res) {
  console.log('[handler] Incoming request', {
    method: req.method,
    url: req.url,
    headersHost: req.headers && req.headers.host,
  });
  if (!server) {
    server = await bootstrap();
    globalThis.__vercelNestServer = server;
  }
  return server(req, res);
}

module.exports = handler;
module.exports.default = handler;


