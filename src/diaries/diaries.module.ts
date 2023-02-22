import { Module } from '@nestjs/common';
import { DiariesController } from './diaries.controller';
import { DiariesService } from './diaries.service';
import { CouplesService } from '../couples/couples.service';
import { CalendarsService } from '../calendars/calendars.service';

@Module({
  controllers: [DiariesController],
  providers: [DiariesService, CouplesService, CalendarsService],
})
export class DiariesModule {}
