import {
  Body,
  Controller,
  Delete,
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

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('다이어리')
@Controller('diaries')
export class DiariesController {
  constructor(
    private readonly diariesService: DiariesService,
    private readonly prismaService: PrismaService,
    private readonly couplesService: CouplesService,
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
    // TODO: 본인 또는 상대방의 calendar의 경우에만 조회 가능
    return await this.prismaService.diary.findMany({
      where: {
        calendarId,
      },
      include: { calendar: true },
    });
  }

  @ApiOperation({ summary: '전체 다이어리 조회' })
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

  // TODO: 다이어리 상세 조회 include calendar

  @ApiOperation({ summary: '다이어리 수정' })
  @Put(':diaryId')
  async updateDiary(
    @currentUser() user: CurrentUserDto,
    @Param('diaryId', ParseIntPipe) diaryId: number,
    @Body() updateDiaryDto: UpdateDiaryDto,
  ) {
    // TODO: 본인 또는 상대방의 diary의 경우에만 수정 가능
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
    // TODO: 본인 또는 상대방의 diary의 경우에만 삭제 가능
    await this.prismaService.diary.delete({
      where: {
        id: diaryId,
      },
    });
    return { message: '다이어리 삭제 완료.' };
  }
}
