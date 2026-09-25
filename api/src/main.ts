import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.setGlobalPrefix('api/v1');
  const port = process.env.PORT ? Number(process.env.PORT) : 3200;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`MAZARI CAPITAL API — http://localhost:${port}/api/v1`);
}

bootstrap();
