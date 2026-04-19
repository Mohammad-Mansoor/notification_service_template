import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { WhatsappService } from './whatsapp.service';
import { NotificationEventDto } from '../../common/dto/notification-event.dto';
import { StructuredLogger } from '../../observability/logger.service';
import { IdempotencyService } from '../../idempotency/idempotency.service';

@Injectable()
export class WhatsappProcessor {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly logger: StructuredLogger,
    private readonly idempotency: IdempotencyService,
  ) {}

  @RabbitSubscribe({
    exchange: 'notifications.exchange',
    routingKey: 'notification.whatsapp',
    queue: 'notification.whatsapp.queue',
    queueOptions: {
      deadLetterExchange: 'notifications.dlx',
      deadLetterRoutingKey: 'dlx.whatsapp.failed',
    },
  })
  public async handleWhatsappQueue(msg: NotificationEventDto) {
    try {
      this.logger.log(`Scaling Worker [Whatsapp] received event.`, 'WhatsappProcessor', msg.eventId);
      
      const isNew = await this.idempotency.checkAndSet(msg.eventId, 'whatsapp');
      if (!isNew) {
        this.logger.warn(`Duplicate event aborted to prevent double message.`, 'WhatsappProcessor', msg.eventId);
        return;
      }

      await this.whatsappService.processWhatsappEvent(msg.payload, msg.eventId);
      
    } catch (e) {
      this.logger.error(`Whatsapp processing error. Pushing to DLX.`, e.stack, 'WhatsappProcessor', msg.eventId);
      return new Nack(false); 
    }
  }
}
