import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { uploadPath } from './utils/uploadFileHandler';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS for testing
  app.enableCors({ origin: '*', credentials: true });

  // Serve static files if uploads folder exists
  if (fs.existsSync(uploadPath)) {
    app.useStaticAssets(uploadPath, { prefix: '/uploads/' });
  } else {
    console.log(`Uploads folder not found, skipping static assets setup.`);
  }

  // Listen on Railway port or 3000
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`🚀 NestJS server running on port ${PORT}`);
}
    // "postbuild": "node scripts/postbuild-copy.js"

bootstrap().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});


