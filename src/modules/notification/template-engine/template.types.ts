// src/modules/notification/template-engine/template.types.ts

/**
 * Enum of supported template event types.
 * Extend this enum when adding new email templates.
 */
export enum TemplateEventType {
  OTP = 'OTP',
  PASSWORD_RESET = 'PASSWORD_RESET',
  MEDICAL_REPORT = 'MEDICAL_REPORT',
  INVOICE = 'INVOICE',
  // New event types added for additional email scenarios
  USER_REGISTERED = 'USER_REGISTERED',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  NEW_DEVICE_LOGIN = 'NEW_DEVICE_LOGIN',
  // Add future event types here
}

/**
 * Input required for rendering a template.
 */
export interface TemplateRenderInput {
  /** Event type that determines which template to use */
  type: TemplateEventType;
  /** Payload passed to Handlebars templates */
  data: Record<string, any>;
}

/**
 * Output returned after rendering.
 */
export interface TemplateOutput {
  /** Rendered email subject */
  subject: string;
  /** Rendered HTML body */
  html: string;
}
