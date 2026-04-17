import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix
  app.setGlobalPrefix('api');

  // Enable CORS for frontend
  app.enableCors({
    origin: [
      process.env.APP_URL ?? 'http://localhost:3000',
      'http://localhost:3000', // Ensure both are allowed
      'http://0.0.0.0:3000',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  });

  // Validation pipe for DTO validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 API running on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error('💥 Error during bootstrap:', err);
  process.exit(1);
});
