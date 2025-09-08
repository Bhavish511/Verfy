// @ts-nocheck
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';

let cachedServer: any;

async function loadAppModule() {
  try {
    const mod = await import('../dist/src/app.module');
    return mod.AppModule;
  } catch {
    const mod = await import('../src/app.module');
    return mod.AppModule;
  }
}

async function bootstrapServer() {
  const expressApp = express();
  const AppModule = await loadAppModule();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors();
  await app.init();

  return serverless(expressApp);
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    cachedServer = await bootstrapServer();
  }
  
  return cachedServer(req, res);
}