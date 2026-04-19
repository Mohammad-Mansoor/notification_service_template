import { NotificationChannel, EventType } from '../enums/notification-channel.enum';

export interface INotificationPayload {
  userId: string | number;
  email?: string;
  phone?: string;
  telegramChatId?: string;
  name?: string;
  [key: string]: any; // Additional contextual data needed for templates
}

export interface INotificationEvent {
  eventId: string; // Unique idempotency key
  type: EventType | string;
  channels: NotificationChannel[];
  payload: INotificationPayload;
  timestamp: string;
}
