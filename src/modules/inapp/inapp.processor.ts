import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { InAppService } from './inapp.service';
import { NotificationEventDto } from '../../common/dto/notification-event.dto';
import { StructuredLogger } from '../../observability/logger.service';
import { IdempotencyService } from '../../idempotency/idempotency.service';

@Injectable()
export class InAppProcessor {
  constructor(
    private readonly inAppService: InAppService,
    private readonly logger: StructuredLogger,
    private readonly idempotency: IdempotencyService,
  ) {}

  @RabbitSubscribe({
    exchange: 'notifications.exchange',
    routingKey: 'notification.inapp',
    queue: 'notification.inapp.queue',
    queueOptions: {
      deadLetterExchange: 'notifications.dlx',
      deadLetterRoutingKey: 'dlx.inapp.failed',
    },
  })
  public async handleInAppQueue(msg: NotificationEventDto) {
    try {
      this.logger.log(`Scaling Worker [InApp] received event.`, 'InAppProcessor', msg.eventId);
      
      const isNew = await this.idempotency.checkAndSet(msg.eventId, 'inapp');
      if (!isNew) return;

      await this.inAppService.processInAppEvent(msg.payload, msg.eventId);
      
    } catch (e) {
      this.logger.error(`InApp processing error. Pushing to DLX.`, e.stack, 'InAppProcessor', msg.eventId);
      return new Nack(false); 
    }
  }
}
