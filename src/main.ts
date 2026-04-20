import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StructuredLogger } from './observability/logger.service';
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Using @golevelup/nestjs-rabbitmq, the connections initialize natively
  // within the standard application container. No createMicroservice hack needed.
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  // Enforce structured logging globally for standard NestJS output!
  const logger = app.get(StructuredLogger);
  const configService = app.get(ConfigService);
  app.useLogger(logger);

  // Redis Socket Adapter
  const redisIoAdapter = new RedisIoAdapter(app, configService);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  // Healthcheck port if needed by K8s
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  logger.log(`🚀 Enterprise Notification Microservice is running and actively listening to RabbitMQ on port ${port}`, 'Bootstrap');
}

//
bootstrap();
