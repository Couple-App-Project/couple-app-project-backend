import { ResponseMessage } from './../constants/response-message';
import { ApiProperty } from '@nestjs/swagger';
import { Calendar } from '@prisma/client';

export class NewCalendarDto {
  @ApiProperty({
    description: '응답 메세지',
    example: ResponseMessage.CREATE_CALENDAR,
  })
  message: string;

  @ApiProperty({ description: '캘린더 id' })
  calendarId: number;

  constructor(message: string, calendar: Calendar) {
    this.message = message;
    this.calendarId = calendar.id;
  }
}
