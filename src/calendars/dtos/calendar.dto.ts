import { ApiProperty } from '@nestjs/swagger';
import { Calendar } from '@prisma/client';

export class CalendarDto {
  @ApiProperty({ description: '일정 id' })
  calendarId: number;

  @ApiProperty({ description: '제목' })
  title: string;

  @ApiProperty({ description: '내용' })
  content: string;

  @ApiProperty({ description: '컬러 (값 enum 활용 필요)' })
  color: string;

  @ApiProperty({ description: '무드 (값 enum 활용 필요)' })
  mood: string;

  constructor(calendar: Calendar) {
    this.calendarId = calendar.id;
    this.title = calendar.title;
    this.content = calendar.content;
    this.color = calendar.color;
    this.mood = calendar.mood;
  }
}
