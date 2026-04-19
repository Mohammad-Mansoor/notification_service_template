import { Module } from '@nestjs/common';
import { InAppService } from './inapp.service';
import { InAppRepository } from './inapp.repository';
import { InAppProcessor } from './inapp.processor';

@Module({
  providers: [InAppService, InAppRepository, InAppProcessor],
  exports: [InAppService],
})
export class InAppModule {}
