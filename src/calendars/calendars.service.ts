import { UpdateCalendarDto } from './dtos/update-calendar.dto';
import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { CurrentUserDto } from 'src/users/dto/current-user.dto';
import { PrismaService } from './../prisma/prisma.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Calendar, Prisma, User } from '@prisma/client';
import { GetCalendarQueryDto } from './dtos/get-calendar-query.dto';
import { ErrorMessage } from './constants/error-message';

@Injectable()
export class CalendarsService {
  constructor(private readonly prismaService: PrismaService) {
    console.log(new Date().toJSON());
  }

  async getCalendars(
    user: CurrentUserDto,
    queryOption: GetCalendarQueryDto,
  ): Promise<(Calendar & { user: User })[]> {
    const currentUserWithCouple = await this.prismaService.user.findFirst({
      where: { id: user.userId },
      include: { couple: { include: { users: true } } },
    });

    if (!currentUserWithCouple) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    const existCouple = currentUserWithCouple.couple;

    const currentCoupleUserIds: number[] = existCouple
      ? existCouple.users.map((user: User) => user.id)
      : [currentUserWithCouple.id];

    return await this.prismaService.calendar.findMany({
      where: {
        userId: { in: currentCoupleUserIds },
        startDate: queryOption.hasMonth()
          ? { gte: queryOption.getStartDate() }
          : undefined,
        endDate: queryOption.hasMonth()
          ? { lte: queryOption.getEndDate() }
          : undefined,
        type: queryOption.hasType() ? queryOption.type : undefined,
        title: queryOption.hasKeyword()
          ? { contains: queryOption.keyword, mode: 'insensitive' }
          : undefined,
      },
      orderBy: [{ startDate: 'asc' }, { startTime: 'asc' }],
      include: { user: true },
    });
  }

  async getCalendar(
    user: CurrentUserDto,
    calendarId: number,
  ): Promise<Calendar & { user: User }> {
    const currentUserWithCouple = await this.prismaService.user.findFirst({
      where: { id: user.userId },
      include: { couple: { include: { users: true } } },
    });

    const existCouple = currentUserWithCouple.couple;

    const currentCoupleUserIds: number[] = existCouple
      ? existCouple.users.map((user: User) => user.id)
      : [currentUserWithCouple.id];

    const existCalendar = await this.prismaService.calendar.findFirst({
      where: {
        id: calendarId,
      },
      include: { user: true },
    });

    if (!existCalendar) {
      throw new BadRequestException(ErrorMessage.NOT_EXIST);
    }

    if (!currentCoupleUserIds.includes(existCalendar.userId)) {
      throw new ForbiddenException(ErrorMessage.FORBDDIEN_READ);
    }

    return existCalendar;
  }

  async createCalendar(
    user: CurrentUserDto,
    createCalendarDto: CreateCalendarDto,
  ): Promise<Calendar> {
    const {
      title,
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      content,
      location,
    } = createCalendarDto;

    const newCalendar: Prisma.CalendarCreateInput = {
      title,
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      content,
      location,
      user: { connect: { id: user.userId } },
    };

    return await this.prismaService.calendar.create({
      data: newCalendar,
    });
  }

  async updateCalendar(
    user: CurrentUserDto,
    updateCalendarDto: UpdateCalendarDto,
    calendarId: number,
  ) {
    const currentUserWithCouple = await this.prismaService.user.findFirst({
      where: { id: user.userId },
      include: { couple: { include: { users: true } } },
    });

    const existCouple = currentUserWithCouple.couple;

    const currentCoupleUserIds: number[] = existCouple
      ? existCouple.users.map((user: User) => user.id)
      : [currentUserWithCouple.id];

    const existCalendar = await this.prismaService.calendar.findFirst({
      where: {
        id: calendarId,
      },
      include: { user: true },
    });

    if (!existCalendar) {
      throw new BadRequestException(ErrorMessage.NOT_EXIST);
    }

    if (!currentCoupleUserIds.includes(existCalendar.userId)) {
      throw new ForbiddenException(ErrorMessage.FORBDDIEN_UPDATE);
    }

    const {
      title,
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      content,
      location,
    } = updateCalendarDto;

    const newCalendar: Prisma.CalendarUpdateInput = {
      title,
      type,
      startDate,
      endDate,
      startTime,
      endTime,
      content,
      location,
    };

    await this.prismaService.calendar.update({
      data: newCalendar,
      where: { id: existCalendar.id },
    });
  }

  async deleteCalendar(user: CurrentUserDto, calendarId: number) {
    const currentUserWithCouple = await this.prismaService.user.findFirst({
      where: { id: user.userId },
      include: { couple: { include: { users: true } } },
    });

    const existCouple = currentUserWithCouple.couple;

    const currentCoupleUserIds: number[] = existCouple
      ? existCouple.users.map((user: User) => user.id)
      : [currentUserWithCouple.id];

    const existCalendar = await this.prismaService.calendar.findFirst({
      where: {
        id: calendarId,
      },
      include: { user: true },
    });

    if (!existCalendar) {
      throw new BadRequestException(ErrorMessage.NOT_EXIST);
    }

    if (!currentCoupleUserIds.includes(existCalendar.userId)) {
      throw new ForbiddenException(ErrorMessage.FORBDDIEN_DELETE);
    }

    await this.prismaService.calendar.delete({ where: { id: calendarId } });
  }
}
