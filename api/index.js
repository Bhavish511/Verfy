// api/index.js
import 'tsconfig-paths/register'; // For path aliases
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module'; // Import from compiled JS
import { NestExpressApplication } from '@nestjs/platform-express';
import serverless from 'serverless-http';
import * as fs from 'fs';
import { uploadPath } from '../dist/utils/uploadFileHandler';

let server;

async function bootstrap() {
    // Create NestJS app as NestExpressApplication
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: ['error', 'warn', 'log'],
    });

    // Enable CORS
    app.enableCors({ origin: '*', credentials: true });

    // Ensure upload directory exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Initialize app without listening (Vercel serverless)
    await app.init();

    // Get underlying Express instance
    const expressApp = app.getHttpAdapter().getInstance();

    // Wrap with serverless-http
    return serverless(expressApp);
}

// Serverless handler
export default async function handler(req, res) {
    if (!server) {
        server = await bootstrap();
    }
    return server(req, res);
}
