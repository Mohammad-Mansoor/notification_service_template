import { IsString } from 'class-validator';

export class TemplateData {
  @IsString() userName: string;
  @IsString() resetTime: string;
  @IsString() temporaryPassword: string;
  @IsString() loginLink: string;
  @IsString() securityHotline: string;
  @IsString() supportEmail: string;
}
