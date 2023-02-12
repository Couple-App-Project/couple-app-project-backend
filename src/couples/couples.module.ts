import { Module } from '@nestjs/common';
import { CouplesController } from './couples.controller';
import { CouplesService } from './couples.service';

@Module({
  controllers: [CouplesController],
  providers: [CouplesService],
})
export class CouplesModule {}
