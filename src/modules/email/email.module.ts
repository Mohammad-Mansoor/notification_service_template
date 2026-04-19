import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProvider } from './email.provider';
import { EmailProcessor } from './email.processor';

@Module({
  providers: [EmailService, EmailProvider, EmailProcessor],
  exports: [EmailService],
})
export class EmailModule {}
