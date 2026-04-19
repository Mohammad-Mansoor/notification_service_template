import { Injectable } from '@nestjs/common';
import { TelegramProvider } from './telegram.provider';
import { StructuredLogger } from '../../observability/logger.service';
import { withSmartRetry } from '../../utils/retry.util';

@Injectable()
export class TelegramService {
  constructor(
    private readonly telegramProvider: TelegramProvider,
    private readonly logger: StructuredLogger
  ) {}

  async processTelegramEvent(payload: any, eventId: string): Promise<void> {
    if (!payload.telegramChatId) {
      throw new Error('Telegram Chat ID is missing in the payload');
    }

    const text = `🤖 Alert: ${JSON.stringify(payload)}!`;
    
    await withSmartRetry(
      () => this.telegramProvider.sendMessage(payload.telegramChatId, text),
      this.logger,
      'TelegramService',
      eventId
    );
  }
}
