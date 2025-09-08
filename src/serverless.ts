import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import * as bodyParser from 'body-parser';

let cachedServer: any;

async function bootstrapServer() {
  const expressApp = express();

  // ✅ Fix raw-body/content-length mismatch
  expressApp.use(bodyParser.json({ limit: '1mb' }));
  expressApp.use(bodyParser.urlencoded({ extended: true }));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors(); // so frontend can call it
  await app.init();

  return serverless(expressApp);
}

export async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  return cachedServer(req, res);
}
