import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { getRabbitMQEnterpriseConfig } from '../config/rabbitmq.config';

/**
 * AppRabbitMQModule configures the RabbitMQ connection exactly once for the
 * entire application and re‑exports the RabbitMQModule so that other feature
 * modules (e.g., NotificationModule) can inject AmqpConnection without
 * re‑initialising the client.
 */
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getRabbitMQEnterpriseConfig(configService),
    }),
  ],
  exports: [RabbitMQModule],
})
export class AppRabbitMQModule {}
