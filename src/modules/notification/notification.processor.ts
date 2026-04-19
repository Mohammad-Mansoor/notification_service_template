import { Injectable } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { NotificationService } from './notification.service';
import { NotificationEventDto } from '../../common/dto/notification-event.dto';
import { StructuredLogger } from '../../observability/logger.service';

@Injectable()
export class NotificationProcessor {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: StructuredLogger
  ) {}

  /**
   * Main API Gateway / Consumer for all incoming raw "Notification Requests"
   */
  @RabbitSubscribe({
    exchange: 'notifications.exchange',
    routingKey: 'notification.events', // The single entrypoint key for the main backend publisher
    queue: 'notification.router.queue',
  })
  public async handleRawNotificationRequest(msg: any) {
    try {
      this.logger.log(`Entrypoint received a raw event block [${msg.eventId}]. Device: ${msg.payload?.deviceName || 'N/A'}. Validating Schema...`, 'NotificationProcessor');

      // 1. Strict Schema Validation
      const dto = plainToInstance(NotificationEventDto, msg);
      await validateOrReject(dto);

      // 2. Version handling check
      if (dto.version !== 1) {
        this.logger.warn(`Received unsupported schema version: ${dto.version}. Attempting graceful parse...`, 'NotificationProcessor', dto.eventId);
      }

      // 3. Scatter it horizontally to independent micro-queues
      await this.notificationService.scatterChannels(dto);

    } catch (errors: any) {
      this.logger.error(`MALFORMED PAYLOAD: Rejecting outright at gateway. Check DLX.`, errors, 'NotificationProcessor');
      return new Nack(false); // Shove malformed junk directly into Dead Letter queue 
    }
  }
}
