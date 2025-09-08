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

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });

  await app.init(); // don’t call listen()
  return app.getHttpAdapter().getInstance(); // return handler
}

// ⚠️ Don’t invoke bootstrap() here.
// Just export the promise for Vercel
export default bootstrap();
