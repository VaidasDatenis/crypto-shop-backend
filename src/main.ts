import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
// import { MyLoggerService } from './my-logger/my-logger.service';
import { AllExceptionsFilter } from './all-exceptions.filter';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { setupHelmet } from './helmet.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupHelmet(app);
  app.useGlobalPipes(new ValidationPipe());
  // const app = await NestFactory.create(AppModule, {
  //   bufferLogs: true,
  // });
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  // app.useLogger(app.get(MyLoggerService));
  app.enableCors();
  app.setGlobalPrefix('api');
  app.use(helmet());
  await app.listen(3000);
}
bootstrap();
