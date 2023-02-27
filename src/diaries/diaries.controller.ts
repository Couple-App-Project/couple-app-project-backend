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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DiariesService } from './diaries.service';
import { currentUser } from '../decorators/user.decorator';
import { CurrentUserDto } from '../users/dto/current-user.dto';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CouplesService } from '../couples/couples.service';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { CalendarsService } from '../calendars/calendars.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { ImagesService } from '../images/images.service';

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
    private readonly imagesService: ImagesService,
  ) {}

  @ApiOperation({ summary: '다이어리 생성' })
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async createDiary(
    @currentUser() user: CurrentUserDto,
    @Body() createDiaryDto: CreateDiaryDto,
    @UploadedFiles() files?: Multer.File[],
  ) {
    const createdDiary = await this.prismaService.diary.create({
      data: {
        userId: user.userId,
        calendarId: Number(createDiaryDto.calendarId),
        title: createDiaryDto.title,
        content: createDiaryDto.content,
      },
    });

    if (files) {
      await this.imagesService.uploadDiaryImages(files, createdDiary.id);
    }

    return {
      message: '다이어리 생성 및 이미지 업로드 완료.',
      createdDiary,
    };
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

    const diaries = await this.prismaService.diary.findMany({
      where: {
        calendarId,
      },
      include: { calendar: true },
    });

    return await Promise.all(
      diaries.map(async (diary) => {
        const images = await this.imagesService.getDiaryImages(diary.id);
        return {
          ...diary,
          images,
        };
      }),
    );
  }

  @ApiOperation({ summary: '다이어리 조회' })
  @Get()
  async getDiaries(@currentUser() user: CurrentUserDto) {
    const [me, you] = await this.couplesService.findMeAndYou(user.userId);
    const diaries = await this.prismaService.diary.findMany({
      where: {
        OR: [{ userId: me.id }, { userId: you.id }],
      },
      include: { calendar: true },
    });

    return await Promise.all(
      diaries.map(async (diary) => {
        const images = await this.imagesService.getDiaryImages(diary.id);
        return {
          ...diary,
          images,
        };
      }),
    );
  }

  @ApiOperation({
    summary: '다이어리 수정',
    description:
      '다이어리 수정 시 기존에 이미 있던 이미지도 다시 업로드해야 하는 덮어 쓰기 방식이다.',
  })
  @Put(':diaryId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async updateDiary(
    @currentUser() user: CurrentUserDto,
    @Param('diaryId', ParseIntPipe) diaryId: number,
    @Body() updateDiaryDto: UpdateDiaryDto,
    @UploadedFiles() files?: Multer.File[],
  ) {
    const isOurDiary = await this.diariesService.isOurDiary(user, diaryId);

    if (!isOurDiary) {
      throw new ForbiddenException('해당 다이어리의 수정 권한 없음.');
    }

    const updatedDiary = await this.prismaService.diary.update({
      where: {
        id: diaryId,
      },
      data: {
        title: updateDiaryDto.title,
        content: updateDiaryDto.content,
      },
    });

    if (files) {
      await this.imagesService.uploadDiaryImages(files, diaryId);
    }

    return {
      message: '다이어리 업데이트 및 이미지 업로드 완료.',
      updatedDiary,
    };
  }

  @ApiOperation({
    summary: '다이어리 삭제',
    description: '다이어리가 포함하는 이미지도 함께 삭제한다.',
  })
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

    await this.imagesService.deleteImagesOfDiary(diaryId);

    return { message: '다이어리 및 저장된 이미지 삭제 완료.' };
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

    return this.prismaService.diary.update({
      where: {
        id: diaryId,
      },
      data: {
        labeled: !currentLabel,
      },
    });
  }
}
