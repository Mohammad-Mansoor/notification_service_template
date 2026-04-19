import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { StructuredLogger } from '../observability/logger.service';

@Injectable()
export class DlqHandlerService {
  constructor(private readonly logger: StructuredLogger) {}

  /**
   * Catches permanently failed messages sent to the Dead Letter Exchange
   * This ensures ZERO messages are ever lost.
   */
  @RabbitSubscribe({
    exchange: 'notifications.dlx',
    routingKey: '#', // Catch all failed dead letter keys
    queue: 'notification.dead_letter.queue',
  })
  public async handleDeadLetter(msg: any) {
    this.logger.error(
      '🔥 DEAD LETTER RECEIVED 🔥', 
      'Message permanently failed processing inside the main queues.',
      'DlqHandlerService',
      msg.eventId, 
      { deadLetterContext: msg }
    );
    
    // In a real SaaS, this would save the message to MongoDB/PostgreSQL here 
    // for developers to manually debug and click a "Replay Message" button in an admin dashboard.
  }
}
