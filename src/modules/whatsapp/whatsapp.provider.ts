import { Injectable } from '@nestjs/common';
import { AppLogger } from '../../utils/logger.util';
import { CircuitBreakerService } from '../../circuit-breaker/circuit-breaker.service';

@Injectable()
export class WhatsappProvider {
  constructor(private readonly circuitBreaker: CircuitBreakerService) {}

  async sendMessage(phone: string, text: string): Promise<boolean> {
    const breaker = this.circuitBreaker.getBreaker('WhatsAppCloudAPI', async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 500);
      });
    });

    return await breaker.fire();
  }
}
