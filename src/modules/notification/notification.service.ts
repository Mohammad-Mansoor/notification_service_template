import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { NotificationEventDto } from '../../common/dto/notification-event.dto';
import { StructuredLogger } from '../../observability/logger.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly logger: StructuredLogger,
  ) {}

  /**
   * The Entrypoint Router.
   * Scatters the multi-channel request into dedicated, isolated queues using RMQ internal routing.
   * This guarantees Horizontal Scalability.
   */
  async scatterChannels(event: NotificationEventDto): Promise<void> {
    const { channels, eventId } = event;
    this.logger.log(`Validating and Routing Event [${eventId}] to ${channels.length} specific channels...`, 'NotificationService', eventId);

    const publishTasks = channels.map((channel) => {
      // Re-publish the exact same DTO safely down exactly the channel needed.
      return this.amqpConnection.publish(
        'notifications.exchange',
        `notification.${channel}`, // Maps to e.g. `notification.email`
        event
      ).catch(err => {
        this.logger.error(`Failed pushing event down [${channel}] pipe.`, err.stack, 'NotificationService', eventId);
      });
    });

    // Wait until all internal dispatches are queued up
    await Promise.allSettled(publishTasks);
  }
}
