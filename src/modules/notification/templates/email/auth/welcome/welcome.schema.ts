import { IsString } from 'class-validator';

export class TemplateData {
  @IsString() userName: string;
  @IsString() emailAddress: string;
  @IsString() temporaryPassword: string;
  @IsString() dashboardLink: string;
  @IsString() supportEmail: string;
}
