import { Module } from '@nestjs/common';
import { CalendarsController } from './calendars.controller';
import { CalendarsService } from './calendars.service';
import { CouplesService } from '../couples/couples.service';

@Module({
  controllers: [CalendarsController],
  providers: [CalendarsService, CouplesService],
})
export class CalendarsModule {}
