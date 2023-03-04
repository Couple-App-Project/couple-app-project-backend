import { Module } from '@nestjs/common';
import { CouplesController } from './couples.controller';
import { CouplesService } from './couples.service';
import { ImagesService } from '../images/images.service';

@Module({
  controllers: [CouplesController],
  providers: [CouplesService, ImagesService],
})
export class CouplesModule {}
