import { IsString } from 'class-validator';

export class TemplateData {
  @IsString() userName: string;
  @IsString() deviceName: string;
  @IsString() browser: string;
  @IsString() loginTime: string;
  @IsString() location: string;
  @IsString() ipAddress: string;
  @IsString() secureAccountLink: string;
}
