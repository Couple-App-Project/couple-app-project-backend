import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { CurrentUserDto } from 'src/users/dto/current-user.dto';
import { PrismaService } from './../prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Calendar, Prisma, User } from '@prisma/client';

@Injectable()
export class CalendarsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCalendars(user: CurrentUserDto): Promise<Calendar[]> {
    const currentUserWithCouple = await this.prismaService.user.findFirst({
      where: { id: user.userId },
      include: { couple: { include: { users: true } } },
    });

    if (!currentUserWithCouple) {
      throw new BadRequestException('잘못된 요청입니다.');
    }

    const currentCoupleUserIds: number[] =
      currentUserWithCouple.couple.users.map((user: User) => user.id);

    return await this.prismaService.calendar.findMany({
      where: { userId: { in: currentCoupleUserIds } },
    });
  }

  async createCalendar(
    user: CurrentUserDto,
    createCalendarDto: CreateCalendarDto,
  ): Promise<void> {
    const { title, type, date, startTime, endTime, content, color, mood } =
      createCalendarDto;

    const newCalendar: Prisma.CalendarCreateInput = {
      title,
      type,
      date,
      startTime,
      endTime,
      content,
      color,
      mood,
      user: { connect: { id: user.userId } },
    };

    await this.prismaService.calendar.create({
      data: newCalendar,
    });
  }
}
