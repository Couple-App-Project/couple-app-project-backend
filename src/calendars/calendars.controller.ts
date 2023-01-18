import { ResponseMessage } from './constants/response-message';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { CalendarsService } from './calendars.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { currentUser } from 'src/decorators/user.decorator';
import { CurrentUserDto } from 'src/users/dto/current-user.dto';
import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { Calendar, User } from '@prisma/client';
import { CalendarDto } from './dtos/calendar.dto';
import { ApiCustomArrayResponseByDto } from 'src/decorators/api-ok-response/custom-array-response.decorator';
import { GetCalendarQueryDto } from './dtos/get-calendar-query.dto';
import { ApiCustomResponseByDto } from 'src/decorators/api-ok-response/custom-response.decorator';
import { UpdateCalendarDto } from './dtos/update-calendar.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('일정 API')
@Controller('calendars')
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}

  @ApiCustomArrayResponseByDto(CalendarDto)
  @ApiOperation({ summary: '캘린더 조회' })
  @Get()
  async getCalendars(
    @currentUser() user: CurrentUserDto,
    @Query() getCalendarQueryDto: GetCalendarQueryDto,
  ): Promise<CalendarDto[]> {
    const calendars: (Calendar & { user: User })[] =
      await this.calendarsService.getCalendars(user, getCalendarQueryDto);

    return calendars.map(
      (result: Calendar & { user: User }) => new CalendarDto(result),
    );
  }

  @ApiCustomResponseByDto(CalendarDto)
  @ApiResponse({ status: 400, description: '해당 일정이 없을때' })
  @ApiResponse({ status: 403, description: '본인 또는 커플의 일정이 아닐때' })
  @ApiOperation({ summary: '특정 캘린더 조회' })
  @Get(':calendarId')
  async getCalendar(
    @currentUser() user: CurrentUserDto,
    @Param('calendarId', ParseIntPipe) calendarId: number,
  ): Promise<CalendarDto> {
    const existCalendar: Calendar & { user: User } =
      await this.calendarsService.getCalendar(user, calendarId);

    return new CalendarDto(existCalendar);
  }

  @ApiOperation({ summary: '캘린더 생성' })
  @Post()
  async createCalendar(
    @currentUser() user: CurrentUserDto,
    @Body() createCalendarDto: CreateCalendarDto,
  ) {
    await this.calendarsService.createCalendar(user, createCalendarDto);

    return ResponseMessage.CREATE_CALENDAR;
  }

  @ApiOperation({ summary: '캘린더 수정' })
  @ApiResponse({ status: 400, description: '해당 일정이 없을때' })
  @ApiResponse({ status: 403, description: '본인 또는 커플의 일정이 아닐때' })
  @Put(':calendarId')
  async updateCalendar(
    @currentUser() user: CurrentUserDto,
    @Body() updateCalendarDto: UpdateCalendarDto,
    @Param('calendarId', ParseIntPipe) calendarId: number,
  ) {
    await this.calendarsService.updateCalendar(
      user,
      updateCalendarDto,
      calendarId,
    );

    return ResponseMessage.UPDATE_CALENDAR;
  }

  @ApiOperation({ summary: '캘린더 삭제' })
  @ApiResponse({ status: 400, description: '해당 일정이 없을때' })
  @ApiResponse({ status: 403, description: '본인 또는 커플의 일정이 아닐때' })
  @Delete(':calendarId')
  async deleteCalendar(
    @currentUser() user: CurrentUserDto,
    @Param('calendarId', ParseIntPipe) calendarId: number,
  ) {
    await this.calendarsService.deleteCalendar(user, calendarId);

    return ResponseMessage.DELETE_CALENDAR;
  }
}
