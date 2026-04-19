import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { TelegramService } from './telegram.service';
import { NotificationEventDto } from '../../common/dto/notification-event.dto';
import { StructuredLogger } from '../../observability/logger.service';
import { IdempotencyService } from '../../idempotency/idempotency.service';

@Injectable()
export class TelegramProcessor {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly logger: StructuredLogger,
    private readonly idempotency: IdempotencyService,
  ) {}

  @RabbitSubscribe({
    exchange: 'notifications.exchange',
    routingKey: 'notification.telegram',
    queue: 'notification.telegram.queue',
    queueOptions: {
      deadLetterExchange: 'notifications.dlx',
      deadLetterRoutingKey: 'dlx.telegram.failed',
    },
  })
  public async handleTelegramQueue(msg: NotificationEventDto) {
    try {
      this.logger.log(`Scaling Worker [Telegram] received event.`, 'TelegramProcessor', msg.eventId);
      
      const isNew = await this.idempotency.checkAndSet(msg.eventId, 'telegram');
      if (!isNew) return;

      await this.telegramService.processTelegramEvent(msg.payload, msg.eventId);
      
    } catch (e) {
      this.logger.error(`Telegram processing error. Pushing to DLX.`, e.stack, 'TelegramProcessor', msg.eventId);
      return new Nack(false); 
    }
  }
}
