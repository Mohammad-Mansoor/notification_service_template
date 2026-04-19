import { Injectable } from '@nestjs/common';
import { EmailProvider } from './email.provider';
import { StructuredLogger } from '../../observability/logger.service';
import { withSmartRetry } from '../../utils/retry.util';
import { TemplateEngine } from '../notification/template-engine/template.engine';
import { TemplateEventType } from '../notification/template-engine/template.types';
import { NotificationEventDto } from '../../common/dto/notification-event.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly emailProvider: EmailProvider,
    private readonly logger: StructuredLogger,
    private readonly templateEngine: TemplateEngine
  ) {}

  async processEmailEvent(msg: NotificationEventDto, eventId: string): Promise<void> {
    const payload = msg.payload;
    if (!payload.email) {
      throw new Error('Email address is missing in the payload');
    }

    // Determine event type
    let eventType = msg.type as any as TemplateEventType;

    // Render HTML and Subject using Template Engine (Caching is disabled internally in the Engine)
    const { subject, html } = await this.templateEngine.render(eventType, payload);

    this.logger.log(`[EmailService] RENDER COMPLETE. Subject: ${subject}`, 'EmailService', eventId);

    await withSmartRetry(
      () => this.emailProvider.sendEmail(payload.email, subject, html),
      this.logger,
      'EmailService',
      eventId
    );
  }
}
