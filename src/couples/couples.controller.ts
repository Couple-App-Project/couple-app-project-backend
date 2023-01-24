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
import { UsersService } from '../users/users.service';
import { CouplesService } from './couples.service';

@ApiTags('커플 관리')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('couples')
export class CouplesController {
  constructor(
    private prismaService: PrismaService,
    private usersService: UsersService,
    private couplesService: CouplesService,
  ) {}

  @Get()
  @ApiOperation({ summary: '커플 코드 조회' })
  async getCoupleCode(@Req() req) {
    const me = await this.prismaService.user.findUnique({
      where: {
        email: req.user.userEmail,
      },
    });
    return { userCode: me.inviteCode };
  }

  @Post()
  @ApiOperation({ summary: '커플 연결' })
  async connectCouple(@Req() req, @Body() connectCoupleDto: ConnectCoupleDto) {
    const me = await this.prismaService.user.findUnique({
      where: { email: req.user.userEmail },
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
    if (you.id === req.user.userId) {
      return new BadRequestException('다른 사람의 코드를 입력하십시오.');
    }

    await this.couplesService.connectNewCouple(me, you);

    return { message: '커플 연결이 완료되었습니다.' };
  }

  @Post('info')
  @ApiOperation({
    summary: '커플 정보 입력 및 수정',
    description: '모든 필드는 선택 입력 사항입니다.',
  })
  async addCoupleInformation(
    @Req() req,
    @Body() addCoupleInformationDto: AddCoupleInformationDto,
  ) {
    const { nickname, todayComment, ...coupleInformation } =
      addCoupleInformationDto;

    const [me, you] = await this.couplesService.findMeAndYou(req.user.userId);

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

    if (coupleInformation) {
      await this.prismaService.couple.update({
        where: { id: me.coupleId },
        data: coupleInformation,
      });

      return { message: '커플 정보 입력 및 수정 완료' };
    }
  }

  @Get('info')
  @ApiOperation({ summary: '커플 정보 조회' })
  async getCoupleInformation(@Req() req) {
    const [me, you] = await this.couplesService.findMeAndYou(req.user.userId);

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
      ...coupleInformation,
    };
  }
}
