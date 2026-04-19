import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramProvider } from './telegram.provider';
import { TelegramProcessor } from './telegram.processor';

@Module({
  providers: [TelegramService, TelegramProvider, TelegramProcessor],
  exports: [TelegramService],
})
export class TelegramModule {}
