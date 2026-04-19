import { Injectable } from '@nestjs/common';
import { WhatsappProvider } from './whatsapp.provider';
import { StructuredLogger } from '../../observability/logger.service';
import { withSmartRetry } from '../../utils/retry.util';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly whatsappProvider: WhatsappProvider,
    private readonly logger: StructuredLogger
  ) {}

  async processWhatsappEvent(payload: any, eventId: string): Promise<void> {
    if (!payload.phone) {
      throw new Error('Phone number is missing in the payload for WhatsApp channel');
    }

    const text = `Hi ${payload.name}, a new event triggered this WhatsApp alert!`;
    
    await withSmartRetry(
      () => this.whatsappProvider.sendMessage(payload.phone, text),
      this.logger,
      'WhatsappService',
      eventId
    );
  }
}
