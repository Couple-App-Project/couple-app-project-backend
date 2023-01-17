import { CreateCalendarDto } from './create-calendar.dto';
import { ApiProperty, PickType } from '@nestjs/swagger';
import { Calendar, User } from '@prisma/client';
import { UserDto } from 'src/common/dtos/user.dto';

export class CalendarDto extends PickType(CreateCalendarDto, [
  'title',
  'type',
  'startDate',
  'endDate',
  'startTime',
  'endTime',
  'content',
  'location',
]) {
  @ApiProperty({ description: '일정 id', example: '1' })
  calendarId: number;

  @ApiProperty({ description: '작성자 정보', type: UserDto })
  authorInfo: UserDto;

  @ApiProperty()
  createdAt: Date;

  constructor(calendar: Calendar & { user: User }) {
    super();
    this.calendarId = calendar.id;
    this.authorInfo = new UserDto(calendar.user);
    this.type = calendar.type;
    this.startDate = calendar.startDate;
    this.endDate = calendar.endDate;
    this.startTime = calendar.startTime;
    this.endTime = calendar.endTime;
    this.title = calendar.title;
    this.content = calendar.content;
    this.location = calendar.location;
  }
}
