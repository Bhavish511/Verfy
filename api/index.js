// api/index.ts
import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import serverless from 'serverless-http';
import * as fs from 'fs';
import { uploadPath } from '../dist/utils/uploadFileHandler';

let server;

async function bootstrap() {
    // Force type as NestExpressApplication
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Enable CORS safely
    if (typeof app.enableCors === 'function') {
        app.enableCors({ origin: '*', credentials: true });
    }

    // Ensure upload folder exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    await app.init();

    const expressApp = app.getHttpAdapter().getInstance();
    return serverless(expressApp);
}

export default async function handler(req, res) {
    if (!server) {
        server = await bootstrap();
    }
    return server(req, res);
}
