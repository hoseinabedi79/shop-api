import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

    // The admin panel runs on a different origin, so the browser needs our permission to call this API
    app.enableCors({
        origin: 'http://localhost:5173',
    });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
