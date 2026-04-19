import { IsString, IsArray, IsEnum, IsObject, IsOptional, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationChannel, EventType } from '../enums/notification-channel.enum';

export class NotificationPayloadDto {
  @IsString()
  userId: string;

  /* Dynamic payload properties allowed */
  [key: string]: any;
}

export class NotificationEventDto {
  @IsString()
  eventId: string; // Used for Idempotency tracking

  @IsEnum(EventType)
  @IsOptional() // Use string if it's dynamic
  type: EventType | string;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @IsObject()
  @ValidateNested()
  @Type(() => NotificationPayloadDto)
  payload: NotificationPayloadDto;

  @IsString()
  timestamp: string;

  @IsNumber()
  @IsOptional()
  version?: number = 1; // Future Proofing message schemas
}
