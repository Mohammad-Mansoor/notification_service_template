import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppRabbitMQModule } from './shared/rabbitmq.module';

import { getRabbitMQEnterpriseConfig } from './config/rabbitmq.config';
import { NotificationModule } from './modules/notification/notification.module';
import { DlqModule } from './dlq/dlq.module';
import { ObservabilityModule } from './observability/observability.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';

import { EmailModule } from './modules/email/email.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { InAppModule } from './modules/inapp/inapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    
    AppRabbitMQModule,

    ObservabilityModule,
    IdempotencyModule,
    CircuitBreakerModule,
    DlqModule,

    NotificationModule,
    EmailModule,
    WhatsappModule,
    TelegramModule,
    InAppModule
  ],
})
export class AppModule {}
