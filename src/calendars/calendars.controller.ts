import { ResponseMessage } from './constants/response-message';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { CalendarsService } from './calendars.service';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/decorators/user.decorator';
import { CurrentUserDto } from 'src/users/dto/current-user.dto';
import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { Calendar } from '@prisma/client';
import { CalendarDto } from './dtos/calendar.dto';
import { ApiCustomArrayResponseByDto } from 'src/decorators/api-ok-response/custom-array-response.decorator';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('일정 API')
@Controller('calendars')
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @ApiCustomArrayResponseByDto(CalendarDto)
  @ApiOperation({ summary: '캘린더 조회' })
  @Get()
  async getCalendars(@User() user: CurrentUserDto): Promise<CalendarDto[]> {
    const results: Calendar[] = await this.calendarsService.getCalendars(user);

    return results.map((result: Calendar) => new CalendarDto(result));
  }

  @ApiOperation({ summary: '캘린더 생성' })
  @Post()
  async createCalendar(
    @User() user: CurrentUserDto,
    @Body() createCalendarDto: CreateCalendarDto,
  ) {
    await this.calendarsService.createCalendar(user, createCalendarDto);

    return ResponseMessage.CREATE_CALENDAR;
  }
}