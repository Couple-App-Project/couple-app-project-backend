import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
import { AddCoupleInformationDto } from './dto/add-couple-information.dto';

@Controller('couples')
export class CouplesController {
  constructor(private prisma: PrismaService) {}
  // TODO: 나와 상대방의 정보를 constructor에서 미리 정의하기.

  @Get()
  @ApiTags('커플 관리')
  @ApiOperation({ summary: '커플 코드 조회' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCoupleCode(@Req() req) {
    const me = await this.prisma.user.findFirst({
      where: { id: req.user.userId },
    });
    return { userCode: me.inviteCode };
  }

  @Post()
  @ApiTags('커플 관리')
  @ApiOperation({ summary: '커플 연결' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async connectCouple(@Req() req, @Body() connectCoupleDto: ConnectCoupleDto) {
    const me = await this.prisma.user.findFirst({
      where: { id: req.user.userId },
    });
    if (me.coupleId) {
      throw new BadRequestException('당신은 이미 커플로 연결된 상태입니다.');
    }

    const you = await this.prisma.user.findFirst({
      where: { inviteCode: connectCoupleDto.inviteCode },
    });
    if (you.coupleId) {
      throw new BadRequestException('상대방이 이미 커플로 연결된 상태입니다.');
    }
    if (you.id === req.user.userId) {
      return new BadRequestException('다른 사람의 코드를 입력하십시오.');
    }

    const newCouple = await this.prisma.couple.create({ data: {} });
    await this.prisma.user.update({
      where: {
        id: req.user.userId,
      },
      data: {
        coupleId: newCouple.id,
      },
    });
    await this.prisma.user.update({
      where: {
        id: you.id,
      },
      data: {
        coupleId: newCouple.id,
      },
    });

    return { message: '커플 연결이 완료되었습니다.' };
  }

  @Post('info')
  @ApiTags('커플 관리')
  @ApiOperation({
    summary: '커플 정보 입력 및 수정',
    description: '모든 필드는 선택 입력 사항입니다.',
  })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addCoupleInformation(
    @Req() req,
    @Body() addCoupleInformationDto: AddCoupleInformationDto,
  ) {
    const { nickname, todayComment, ...coupleInformation } =
      addCoupleInformationDto;

    // 나의 커플 id 알기
    const me = await this.prisma.user.findFirst({
      where: {
        id: req.user.userId,
      },
    });

    // 커플 id로 검색하여 상대방 데이터에 접근
    const meAndYou = await this.prisma.user.findMany({
      where: {
        coupleId: me.coupleId,
      },
    });
    const you = meAndYou.filter((value) => value.id !== req.user.userId)[0];

    if (nickname) {
      // nickname 변경
      await this.prisma.user.update({
        where: {
          id: you.id,
        },
        data: {
          nickname,
        },
      });
    }

    if (todayComment) {
      await this.prisma.user.update({
        where: {
          id: me.id,
        },
        data: {
          todayComment,
        },
      });
    }

    if (coupleInformation) {
      // 커플 정보 업데이트
      await this.prisma.couple.update({
        where: {
          id: me.coupleId,
        },
        data: coupleInformation,
      });

      return { message: '커플 정보 입력 및 수정 완료' };
    }
  }

  @Get('info')
  @ApiTags('커플 관리')
  @ApiOperation({ summary: '커플 정보 조회' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getCoupleInformation(@Req() req) {
    // 커플 아이디 파악
    const me = await this.prisma.user.findFirst({
      where: {
        id: req.user.userId,
      },
    });

    // 상대방 파악
    const meAndYou = await this.prisma.user.findMany({
      where: {
        coupleId: me.coupleId,
      },
    });
    const you = meAndYou.filter((value) => value.id !== req.user.userId)[0];

    // 나와 상대방의 닉네임을 추출 (없을 경우 이름)
    const myNickname = me.nickname || me.name;
    const yourNickname = you.nickname || you.name;

    const myBirthday = me.birthDay;
    const yourBirthday = you.birthDay;

    const myTodayComment = me.todayComment;
    const yourTodayComment = you.todayComment;

    // coupleInformation 추출
    const { createdAt, updatedAt, id, ...coupleInformation } =
      await this.prisma.couple.findUnique({
        where: {
          id: me.coupleId,
        },
      });

    // 묶어서 return
    return {
      myNickname,
      yourNickname,
      myBirthday,
      yourBirthday,
      myTodayComment,
      yourTodayComment,
      ...coupleInformation,
    };
  }
}
