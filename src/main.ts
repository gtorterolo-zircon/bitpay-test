import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const corsOptions = {
  //   // exposedHeaders: [
  //   //   'Content-Range',
  //   //   'Link',
  //   //   'Max-Skus-Min-Price',
  //   //   'Skus-Creators',
  //   //   'Skus-Editions',
  //   //   'Skus-Categories',
  //   //   'Skus-Collections',
  //   //   'Auction-Bid-Increment',
  //   //   'Initial-Buyers-Fee-Percentage',
  //   // ],
  //   // allowedHeaders: [
  //   //   'Origin',
  //   //   'X-Requested-With',
  //   //   'Content-Type',
  //   //   'Accept',
  //   //   'Authorization',
  //   //   'X-Tenant',
  //   //   'Sentry-Trace',
  //   // ],
  //   // methods: ['GET, POST, OPTIONS, PUT, PATCH, DELETE'],
  //   origin: '*',
  //   methods: '*',
  // };
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
