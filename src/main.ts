import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as jsonServer from 'json-server';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { uploadPath } from './utils/uploadFileHandler';
import { NestExpressApplication } from '@nestjs/platform-express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  app.useStaticAssets(uploadPath, {
    prefix: '/uploads/',
  });
  await app.listen(process.env.PORT ?? 3000);
  // app.setGlobalPrefix("/api/v1")
  console.log(`Server Listening at Port ${process.env.PORT}`);
}
bootstrap();
