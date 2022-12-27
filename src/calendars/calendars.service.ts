import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { CurrentUserDto } from 'src/users/dto/current-user.dto';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Calendar, Prisma } from '@prisma/client';

@Injectable()
export class CalendarsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCalendars(user: CurrentUserDto): Promise<Calendar[]> {
    return await this.prismaService.calendar.findMany({
      where: { userId: user.userId },
      include: { user: { include: { couple: true } } },
    });
  }
  async createCalendar(
    user: CurrentUserDto,
    createCalendarDto: CreateCalendarDto,
  ): Promise<void> {
    const { title, content, color, mood } = createCalendarDto;

    const newCalendar: Prisma.CalendarCreateInput = {
      title,
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
