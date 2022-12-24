import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectCoupleDto } from './dto/connect-couple.dto';
import { AddCoupleInformationDto } from './dto/add-couple-information.dto';

@Controller('couples')
export class CouplesController {
  constructor(private prisma: PrismaService) {}
  @Post()
  @ApiOperation({ summary: '커플 연결' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async connectCouple(@Req() req, @Body() connectCoupleDto: ConnectCoupleDto) {
    const me = await this.prisma.user.findFirst({
      where: { id: req.user.userId },
    });
    if (me.coupleId) {
      return { message: '당신은 이미 커플로 연결된 상태입니다.' };
    }

    const opponent = await this.prisma.user.findFirst({
      where: { inviteCode: connectCoupleDto.inviteCode },
    });
    if (opponent.coupleId) {
      return { message: '상대방이 이미 커플로 연결된 상태입니다.' };
    }
    if (opponent.id === req.user.userId) {
      return { message: '다른 사람의 코드를 입력하십시오.' };
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
        id: opponent.id,
      },
      data: {
        coupleId: newCouple.id,
      },
    });

    return { message: '커플 연결이 완료되었습니다.' };
  }

  @Post('info')
  @ApiOperation({ summary: '커플 정보 입력 및 수정' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async addCoupleInformation(
    @Req() req,
    @Body() addCoupleInformationDto: AddCoupleInformationDto,
  ) {
    const { nickname, ...coupleInformation } = addCoupleInformationDto;

    // 나의 커플 id 알기
    const me = await this.prisma.user.findFirst({
      where: {
        id: req.user.userId,
      },
    });

    // 커플 id로 검색하여 상대방 데이터에 접근
    const meAndOpponent = await this.prisma.user.findMany({
      where: {
        coupleId: me.coupleId,
      },
    });
    const opponent = meAndOpponent.filter(
      (value) => value.id !== req.user.userId,
    )[0];

    // nickname 변경
    await this.prisma.user.update({
      where: {
        id: opponent.id,
      },
      data: {
        nickname: nickname,
      },
    });

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
