import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { uploadPath } from './utils/uploadFileHandler';
import { NestExpressApplication } from '@nestjs/platform-express';
import 'tsconfig-paths/register';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure uploads folder exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Serve static files
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  // Enable CORS for testing (adjust frontend URL if needed)
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Use PORT from Railway environment, default to 3000
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);

  console.log(`NestJS server is running on port ${PORT}`);
}

bootstrap();
