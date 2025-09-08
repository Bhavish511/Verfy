// api/index.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import serverless from 'serverless-http';
import * as fs from 'fs';
import { uploadPath } from '../dist/utils/uploadFileHandler';

let server: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule as any);

  // Enable CORS
  if (typeof app.enableCors === 'function') {
    app.enableCors({ origin: '*', credentials: true });
  }

  // Ensure uploads folder exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Serve static files
  app.useStaticAssets(uploadPath, { prefix: '/uploads/' });

  const expressApp = app.getHttpAdapter().getInstance();
  return serverless(expressApp);
}

export default async function handler(req: any, res: any) {
  if (!server) {
    server = await bootstrap();
  }
  return server(req, res);
}
