import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappProvider } from './whatsapp.provider';
import { WhatsappProcessor } from './whatsapp.processor';

@Module({
  providers: [WhatsappService, WhatsappProvider, WhatsappProcessor],
  exports: [WhatsappService],
})
export class WhatsappModule {}
