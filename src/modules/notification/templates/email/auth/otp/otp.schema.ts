import { IsString, IsNumber } from 'class-validator';

export class TemplateData {
  @IsString() userName: string;
  @IsString() otpCode: string;
  @IsNumber() validityMinutes: number;
  @IsString() requestTime: string;
  @IsString() expirationTime: string;
  @IsString() supportEmail: string;
}
