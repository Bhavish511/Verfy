import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import serverless from 'serverless-http';

let server: any;

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		logger: ['error', 'warn', 'log'],
	});

	app.enableCors({ origin: '*', credentials: true });

	await app.init();
	const expressApp = app.getHttpAdapter().getInstance();
	return serverless(expressApp);
}

export default async function handler(req: any, res: any) {
	if (!server) {
		server = await bootstrap();
	}
	return server(req, res);
}