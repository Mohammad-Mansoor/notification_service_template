import { Injectable } from '@nestjs/common';
import { InAppRepository } from './inapp.repository';
import { StructuredLogger } from '../../observability/logger.service';
import { withSmartRetry } from '../../utils/retry.util';

@Injectable()
export class InAppService {
  constructor(
    private readonly inAppRepository: InAppRepository,
    private readonly logger: StructuredLogger
  ) {}

  async processInAppEvent(payload: any, eventId: string): Promise<void> {
    if (!payload.userId) {
      throw new Error('User ID is legally required for In-App DB storage');
    }

    const message = `You have a new alert: ${JSON.stringify(payload)}`;
    
    await withSmartRetry(
      () => this.inAppRepository.saveNotification(payload.userId, message),
      this.logger,
      'InAppService',
      eventId
    );
  }
}
