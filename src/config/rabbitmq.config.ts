import { RabbitMQConfig, RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';

export const getRabbitMQEnterpriseConfig = (configService: ConfigService): RabbitMQConfig => {
  return {
    exchanges: [
      {
        name: 'notifications.exchange',
        type: 'topic',
      },
      {
        name: 'notifications.dlx', // Dead Letter Exchange
        type: 'topic',
      }
    ],
    uri: configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672',
    connectionInitOptions: { wait: false },
    channels: {
      'default': {
        prefetchCount: 5, // Process 5 messages currently per worker
        default: true
      }
    }
  };
};
