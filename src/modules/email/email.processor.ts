import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { EmailService } from './email.service';
import { NotificationEventDto } from '../../common/dto/notification-event.dto';
import { StructuredLogger } from '../../observability/logger.service';

@Injectable()
export class EmailProcessor {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: StructuredLogger,
  ) {}

  @RabbitSubscribe({
    exchange: 'notifications.exchange',
    routingKey: 'notification.email',
    queue: 'notification.email.queue',
    queueOptions: {
      deadLetterExchange: 'notifications.dlx',
      deadLetterRoutingKey: 'dlx.email.failed',
    },
  })
  public async handleEmailQueue(msg: NotificationEventDto) {
    try {
      this.logger.log(`Scaling Worker [Email] received event.`, 'EmailProcessor', msg.eventId);
      
      // Removed Idempotency Check to ensure "Zero Cache" processing on every request
      await this.emailService.processEmailEvent(msg, msg.eventId);
      
    } catch (e) {
      this.logger.error(`Critical Email processing error. Pushing to DLX.`, e.stack, 'EmailProcessor', msg.eventId);
      return new Nack(false); // Reject gracefully to Dead Letter Queue without requeueing endlessly
    }
  }
}
