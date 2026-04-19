// src/modules/notification/template-engine/template.registry.resolver.ts

import { TemplateEventType } from './template.types';
import path from 'path';

/**
 * Registry that maps a TemplateEventType to the concrete Handlebars template
 * file locations for both the HTML body and the subject line.
 *
 * The paths are absolute and built relative to the `templates` directory.
 * Adding a new event type only requires extending the enum in
 * `template.types.ts` and adding a new entry here – the rest of the engine
 * remains untouched.
 */
export class TemplateRegistryResolver {
  /** Base directory where email templates reside */
  private readonly templatesBase: string;

  constructor(templatesBase: string) {
    this.templatesBase = templatesBase; // e.g. src/modules/notification/templates
  }

  /** Resolve the absolute paths for the HTML and subject templates */
  resolve(eventType: TemplateEventType): {
    htmlPath: string;
    subjectPath: string;
  } {
    switch (eventType) {
      case TemplateEventType.OTP:
        return {
          htmlPath: path.resolve(
            this.templatesBase,
            'email/auth/otp/otp.html.hbs',
          ),
          subjectPath: path.resolve(
            this.templatesBase,
            'email/auth/otp/otp.subject.hbs',
          ),
        };
      case TemplateEventType.PASSWORD_RESET:
        return {
          htmlPath: path.resolve(
            this.templatesBase,
            'email/auth/password-reset/password-reset.html.hbs',
          ),
          subjectPath: path.resolve(
            this.templatesBase,
            'email/auth/password-reset/password-reset.subject.hbs',
          ),
        };
      case TemplateEventType.MEDICAL_REPORT:
        return {
          htmlPath: path.resolve(
            this.templatesBase,
            'email/healthcare/medical-report/medical-report.html.hbs',
          ),
          subjectPath: path.resolve(
            this.templatesBase,
            'email/healthcare/medical-report/medical-report.subject.hbs',
          ),
        };
      case TemplateEventType.INVOICE:
        return {
          htmlPath: path.resolve(
            this.templatesBase,
            'email/billing/invoice/invoice.html.hbs',
          ),
          subjectPath: path.resolve(
            this.templatesBase,
            'email/billing/invoice/invoice.subject.hbs',
          ),
        };
      case TemplateEventType.USER_REGISTERED:
        return {
          htmlPath: path.resolve(
            this.templatesBase,
            'email/auth/welcome/welcome.html.hbs',
          ),
          subjectPath: path.resolve(
            this.templatesBase,
            'email/auth/welcome/welcome.subject.hbs',
          ),
        };
      case TemplateEventType.NEW_DEVICE_LOGIN:
        return {
          htmlPath: path.resolve(
            this.templatesBase,
            'email/auth/new-device/new-device.html.hbs',
          ),
          subjectPath: path.resolve(
            this.templatesBase,
            'email/auth/new-device/new-device.subject.hbs',
          ),
        };
      default:
        throw new Error(`No template mapping defined for event type: ${eventType}`);
    }
  }
}
