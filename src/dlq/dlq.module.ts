import { Module } from '@nestjs/common';
import { DlqHandlerService } from './dlq.handler.service';

@Module({
  providers: [DlqHandlerService],
})
export class DlqModule {}
