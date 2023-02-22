import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DiariesService } from './diaries.service';
import { currentUser } from '../decorators/user.decorator';
import { CurrentUserDto } from '../users/dto/current-user.dto';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CouplesService } from '../couples/couples.service';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { CalendarsService } from '../calendars/calendars.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('다이어리')
@Controller('diaries')
export class DiariesController {
  constructor(
    private readonly diariesService: DiariesService,
    private readonly prismaService: PrismaService,
    private readonly couplesService: CouplesService,
    private readonly calendarsService: CalendarsService,
  ) {}

  @ApiOperation({ summary: '다이어리 생성' })
  @Post()
  async createDiary(
    @currentUser() user: CurrentUserDto,
    @Body() createDiaryDto: CreateDiaryDto,
  ) {
    return await this.prismaService.diary.create({
      data: {
        userId: user.userId,
        ...createDiaryDto,
      },
    });
  }

  @ApiOperation({ summary: '해당 일정의 다이어리 조회' })
  @Get(':calendarId')
  async getDiariesByCalendarId(
    @currentUser() user: CurrentUserDto,
    @Param('calendarId', ParseIntPipe) calendarId: number,
  ) {
    const isOurCalendar = await this.calendarsService.isOurCalendar(
      user,
      calendarId,
    );

    if (!isOurCalendar) {
      throw new ForbiddenException('해당 일정의 다이어리 조회 권한 없음.');
    }

    return await this.prismaService.diary.findMany({
      where: {
        calendarId,
      },
      include: { calendar: true },
    });
  }

  @ApiOperation({ summary: '다이어리 조회' })
  @Get()
  async getDiaries(@currentUser() user: CurrentUserDto) {
    const [me, you] = await this.couplesService.findMeAndYou(user.userId);
    return await this.prismaService.diary.findMany({
      where: {
        OR: [{ userId: me.id }, { userId: you.id }],
      },
      include: { calendar: true },
    });
  }

  @ApiOperation({ summary: '다이어리 수정' })
  @Put(':diaryId')
  async updateDiary(
    @currentUser() user: CurrentUserDto,
    @Param('diaryId', ParseIntPipe) diaryId: number,
    @Body() updateDiaryDto: UpdateDiaryDto,
  ) {
    const isOurDiary = await this.diariesService.isOurDiary(user, diaryId);

    if (!isOurDiary) {
      throw new ForbiddenException('해당 다이어리의 수정 권한 없음.');
    }

    return await this.prismaService.diary.update({
      where: {
        id: diaryId,
      },
      data: updateDiaryDto,
    });
  }

  @ApiOperation({ summary: '다이어리 삭제' })
  @Delete(':diaryId')
  async deleteDiary(
    @currentUser() user: CurrentUserDto,
    @Param('diaryId', ParseIntPipe) diaryId: number,
  ) {
    const isOurDiary = await this.diariesService.isOurDiary(user, diaryId);

    if (!isOurDiary) {
      throw new ForbiddenException('해당 다이어리의 삭제 권한 없음.');
    }

    await this.prismaService.diary.delete({
      where: {
        id: diaryId,
      },
    });
    return { message: '다이어리 삭제 완료.' };
  }

  @ApiOperation({ summary: '다이어리 라벨 ON/OFF' })
  @Put('label/:diaryId')
  async onOffDiaryLabel(
    @currentUser() user: CurrentUserDto,
    @Param('diaryId', ParseIntPipe) diaryId: number,
  ) {
    const isOurDiary = await this.diariesService.isOurDiary(user, diaryId);

    if (!isOurDiary) {
      throw new ForbiddenException('해당 다이어리의 수정 권한 없음.');
    }

    const diary = await this.prismaService.diary.findUnique({
      where: {
        id: diaryId,
      },
    });

    const currentLabel = diary.labeled;

    return await this.prismaService.diary.update({
      where: {
        id: diaryId,
      },
      data: {
        labeled: !currentLabel,
      },
    });
  }
}
