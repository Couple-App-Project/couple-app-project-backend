import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
import { AddCoupleInformationDto } from './dto/add-couple-information.dto';
import { CouplesService } from './couples.service';
import { currentUser } from '../decorators/user.decorator';
import { CurrentUserDto } from '../users/dto/current-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { ImagesService } from '../images/images.service';

@ApiTags('커플 및 정보 관리')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('couples')
export class CouplesController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly couplesService: CouplesService,
    private readonly imagesService: ImagesService,
  ) {}

  @Get()
  @ApiOperation({ summary: '커플 코드 조회' })
  async getCoupleCode(@currentUser() user: CurrentUserDto) {
    const me = await this.prismaService.user.findUnique({
      where: {
        email: user.userEmail,
      },
    });
    return { userCode: me.inviteCode };
  }

  @Post()
  @ApiOperation({ summary: '커플 연결' })
  async connectCouple(
    @currentUser() user: CurrentUserDto,
    @Body() connectCoupleDto: ConnectCoupleDto,
  ) {
    const me = await this.prismaService.user.findUnique({
      where: { email: user.userEmail },
    });
    if (me.coupleId) {
      throw new BadRequestException('당신은 이미 커플로 연결된 상태입니다.');
    }

    const you = await this.prismaService.user.findFirst({
      where: { inviteCode: connectCoupleDto.inviteCode },
    });
    if (you.coupleId) {
      throw new BadRequestException('상대방이 이미 커플로 연결된 상태입니다.');
    }
    if (you.id === user.userId) {
      return new BadRequestException('다른 사람의 코드를 입력하십시오.');
    }

    await this.couplesService.connectNewCouple(me, you);

    return { message: '커플 연결이 완료되었습니다.' };
  }

  @Post('info')
  @ApiOperation({
    summary: '정보 입력 및 수정',
    description: '모든 필드는 선택 입력 사항입니다.',
  })
  async addCoupleInformation(
    @currentUser() user: CurrentUserDto,
    @Body() addCoupleInformationDto: AddCoupleInformationDto,
  ) {
    const { nickname, todayComment, backgroundColor, ...coupleInformation } =
      addCoupleInformationDto;

    const [me, you] = await this.couplesService.findMeAndYou(user.userId);

    if (nickname) {
      await this.prismaService.user.update({
        where: { id: you.id },
        data: { nickname },
      });
    }

    if (todayComment) {
      await this.prismaService.user.update({
        where: { id: me.id },
        data: { todayComment },
      });
    }

    if (backgroundColor) {
      await this.prismaService.user.update({
        where: { id: me.id },
        data: { backgroundColor },
      });
    }

    if (coupleInformation) {
      await this.prismaService.couple.update({
        where: { id: me.coupleId },
        data: coupleInformation,
      });

      return { message: '커플 및 홈화면 정보 입력 및 수정 완료' };
    }
  }

  @Get('info')
  @ApiOperation({ summary: '정보 조회' })
  async getCoupleInformation(@currentUser() user: CurrentUserDto) {
    const [me, you] = await this.couplesService.findMeAndYou(user.userId);

    // 나와 상대방의 닉네임을 추출 (없을 경우 이름)
    const myNickname = me.nickname || me.name;
    const yourNickname = you.nickname || you.name;

    const myBirthday = me.birthDay;
    const yourBirthday = you.birthDay;

    const myTodayComment = me.todayComment;
    const yourTodayComment = you.todayComment;

    // coupleInformation 추출
    const { createdAt, updatedAt, id, ...coupleInformation } =
      await this.prismaService.couple.findUnique({
        where: { id: me.coupleId },
      });

    // 묶어서 return
    return {
      myNickname,
      yourNickname,
      myBirthday,
      yourBirthday,
      myTodayComment,
      yourTodayComment,
      backgroundColor: me.backgroundColor,
      ...coupleInformation,
    };
  }

  @Post('background-image')
  @ApiOperation({
    summary: '배경 이미지 등록',
    description: '용량 제한 5MB',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async setBackgroundImage(
    @currentUser() user: CurrentUserDto,
    @UploadedFile() file: Multer.File,
  ) {
    const coupleId = await this.couplesService.getCoupleId(user);
    await this.imagesService.uploadBackgroundImage(file, coupleId);
    return { message: '배경 이미지 등록 완료.' };
  }

  @Get('background-image')
  @ApiOperation({ summary: '배경 이미지 다운로드 url' })
  async getBackgroundImage(@currentUser() user: CurrentUserDto) {
    const coupleId = await this.couplesService.getCoupleId(user);
    return await this.imagesService.getBackgroundImage(coupleId);
  }
}
