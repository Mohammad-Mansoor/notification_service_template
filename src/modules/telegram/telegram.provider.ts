import { Injectable } from '@nestjs/common';
import { AppLogger } from '../../utils/logger.util';
import { CircuitBreakerService } from '../../circuit-breaker/circuit-breaker.service';

@Injectable()
export class TelegramProvider {
  constructor(private readonly circuitBreaker: CircuitBreakerService) {}

  async sendMessage(chatId: string, text: string): Promise<boolean> {
    const breaker = this.circuitBreaker.getBreaker('TelegramBotAPI', async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 300);
      });
    });

    return await breaker.fire();
  }
}
