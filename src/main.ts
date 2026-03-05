import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { loggingInterceptors } from './shared/interceptors/logging.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe( { transform: true, whitelist: true } ));
  app.enableCors({  
    origin: '*',
    methods: 'GET,PATCH,POST,DELETE',
  });
  app.useGlobalInterceptors(new loggingInterceptors())
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
