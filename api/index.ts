import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../dist/app.module'; // point to compiled JS
import { NestExpressApplication } from '@nestjs/platform-express';
import serverless from 'serverless-http';

let server;

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		logger: ['error', 'warn', 'log'],
	});

	// Enable CORS for serverless
	app.enableCors({ origin: '*', credentials: true });

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
