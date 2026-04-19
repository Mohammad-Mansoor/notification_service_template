import { Module } from '@nestjs/common';
import { AppRabbitMQModule } from '../../shared/rabbitmq.module';

import { NotificationService } from './notification.service';
import { NotificationProcessor } from './notification.processor';
import { EmailModule } from '../email/email.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { TelegramModule } from '../telegram/telegram.module';
import { InAppModule } from '../inapp/inapp.module';
import { TemplateEngineModule } from './template-engine/template-engine.module';

@Module({
  imports: [AppRabbitMQModule, TemplateEngineModule, EmailModule, WhatsappModule, TelegramModule, InAppModule],
  providers: [NotificationService, NotificationProcessor],
})
export class NotificationModule {}
