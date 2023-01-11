import { CreateCalendarDto } from './create-calendar.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Calendar } from '@prisma/client';

export class CalendarDto extends PickType(CreateCalendarDto, [
  'title',
  'type',
  'date',
  'startTime',
  'endTime',
  'content',
  'color',
  'mood',
]) {
  @ApiProperty({ description: '일정 id', example: '1' })
  calendarId: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  createdAt: Date;

  constructor(calendar: Calendar) {
    super();
    this.calendarId = calendar.id;
    this.type = calendar.type;
    this.date = calendar.date;
    this.startTime = calendar.startTime;
    this.endTime = calendar.endTime;
    this.title = calendar.title;
    this.content = calendar.content;
    this.color = calendar.color;
    this.mood = calendar.mood;
  }
}
